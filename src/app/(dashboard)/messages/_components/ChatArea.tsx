"use client";

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import Image from "next/image";
import MessageInput from "./MessageInput";
import { Eye, Download, FileText, MoreVertical } from "lucide-react";
import { Conversation, Message, MessageFile, SocketMessage } from "@/types/chat";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

interface ChatAreaProps {
  conversation: Conversation;
  currentUser: User | null;
  socket: Socket;
  onOpenSidebar: () => void;
}

function mapSocketToMessage(msg: any, currentUser: User, conversation: Conversation): Message {
  return {
    id: msg._id || msg.tempId || `msg-${Date.now()}`,
    senderId: msg.senderId || msg.from,
    receiverId: msg.receiverId || msg.to,
    text: msg.messageText || msg.text || "",
    timestamp: msg.createdAt || new Date().toISOString(),
    sender: msg.senderId === currentUser._id ? "me" : "other",
    avatar:
      msg.senderId === currentUser._id
        ? currentUser.profileImage || "/my-avatar.png"
        : conversation.avatar,
    files: msg.files || [],
    replyTo: msg.replyTo
      ? mapSocketToMessage(msg.replyTo, currentUser, conversation)
      : undefined,
  };
}

export default function ChatArea({ conversation, currentUser, socket, onOpenSidebar }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [blockStatus, setBlockStatus] = useState({ iBlocked: false, blockedMe: false });
  const [conversationOnline, setConversationOnline] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportImages, setReportImages] = useState<File[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") =>
    messagesEndRef.current?.scrollIntoView({ behavior });

  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollTop + clientHeight >= scrollHeight - 100;
  };

  const handleScroll = () => setShouldAutoScroll(isAtBottom());
  // -------------------------
  // Socket listeners (robust & normalized)
  // -------------------------
  useEffect(() => {
    if (!socket || !currentUser || !conversation) return;

    const norm = (m: any) => ({
      _id: m._id || m.id || null,
      tempId: m.tempId || m.tempID || m.temp || (m._tempId as string | undefined) || null,
      senderId: m.senderId || m.from || m.sender || null,
      receiverId: m.receiverId || m.to || m.receiver || null,
      messageText: m.messageText || m.text || m.message || "",
      createdAt: m.createdAt || m.timestamp || new Date().toISOString(),
      files: m.files || m.attachments || [],
      replyTo: m.replyTo || m.replyToId || null,
      raw: m,
    });

    const upsertServerMessage = (rawMsg: any) => {
      const m = norm(rawMsg);
      setMessages((prev) => {
        // 1) Replace by tempId
        if (m.tempId) {
          const idx = prev.findIndex((p) => (p as any).id === m.tempId || (p as any)._tempId === m.tempId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = mapSocketToMessage(m.raw, currentUser, conversation);
            return updated;
          }
        }

        // 2) Replace by _id
        if (m._id) {
          const idx2 = prev.findIndex((p) => p.id === m._id);
          if (idx2 !== -1) {
            const updated = [...prev];
            updated[idx2] = mapSocketToMessage(m.raw, currentUser, conversation);
            return updated;
          }
        }

        // 3) Fuzzy replace last optimistic (same sender, same text, close timestamp)
        if (m.senderId === currentUser._id) {
          const lastIndex = prev.length - 1;
          if (lastIndex >= 0) {
            const last = prev[lastIndex];
            const timeDiff =
              Math.abs(new Date(m.createdAt).getTime() - new Date(last.timestamp).getTime()) || Infinity;
            if (last.senderId === currentUser._id && last.text === m.messageText && timeDiff < 4000) {
              const updated = [...prev];
              updated[lastIndex] = mapSocketToMessage(m.raw, currentUser, conversation);
              return updated;
            }
          }
        }

        // 4) avoid duplicates by _id
        if (m._id && prev.some((p) => p.id === m._id)) return prev;

        // otherwise append
        return [...prev, mapSocketToMessage(m.raw, currentUser, conversation)];
      });
    };

    const handleSentMessage = (rawMsg: any) => {
      const m = norm(rawMsg);
      const relevant =
        m.receiverId === conversation.id ||
        m.senderId === conversation.id ||
        m.senderId === currentUser._id ||
        m.receiverId === currentUser._id;
      if (!relevant) return;

      upsertServerMessage(rawMsg);
    };

    const handleIncomingMessage = (rawMsg: any) => {
      const m = norm(rawMsg);

      // If this is an echo of my own send, upsert and return
      if (m.senderId === currentUser._id || m.senderId === currentUser?._id) {
        upsertServerMessage(rawMsg);
        setShouldAutoScroll(true);
        return;
      }

      // Validate it's from conversation partner to me
      const isRelevant =
        (m.senderId === conversation.id && m.receiverId === currentUser._id) ||
        (m.receiverId === conversation.id && m.senderId === currentUser._id);
      if (!isRelevant) return;

      setMessages((prev) => {
        if (m._id && prev.some((p) => p.id === m._id)) return prev;
        return [...prev, mapSocketToMessage(rawMsg, currentUser, conversation)];
      });

      setShouldAutoScroll(true);
    };

    const handleUserBlocked = (data: any) => {
      const whoBlocked = data.blockedBy || data.by;
      if (whoBlocked === conversation.id) {
        setBlockStatus((prev) => ({ ...prev, blockedMe: true }));
        alert("This user has blocked you.");
      }
    };

    const handleUserUnblocked = (data: any) => {
      const who = data.unblockedBy || data.by;
      if (who === conversation.id) {
        setBlockStatus((prev) => ({ ...prev, blockedMe: false }));
        alert("You are unblocked by this user.");
      }
    };

    const handleUserOnline = (userId: string) => {
      if (userId === conversation.id) setConversationOnline(true);
    };
    const handleUserOffline = (userId: string) => {
      if (userId === conversation.id) setConversationOnline(false);
    };

    socket.on("msg-sent", handleSentMessage);
    socket.on("msg-receive", handleIncomingMessage);
    socket.on("user-blocked", handleUserBlocked);
    socket.on("user-unblocked", handleUserUnblocked);
    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);

    return () => {
      socket.off("msg-sent", handleSentMessage);
      socket.off("msg-receive", handleIncomingMessage);
      socket.off("user-blocked", handleUserBlocked);
      socket.off("user-unblocked", handleUserUnblocked);
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
    };
  }, [socket, currentUser, conversation]);

  // close active message menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".message-bubble")) {
        setActiveMessageId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // autoscroll when messages change
  useEffect(() => {
    if (shouldAutoScroll) scrollToBottom();
  }, [messages, shouldAutoScroll]);

  // when switching conversation quickly scroll instantly
  useEffect(() => {
    if (conversation) {
      setShouldAutoScroll(true);
      setTimeout(() => scrollToBottom("instant"), 100);
    }
  }, [conversation.id]);

  // Fetch messages for conversation
  useEffect(() => {
    if (!currentUser || !conversation) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message?currentUserId=${conversation.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        const loadedMessages: Message[] = data.data.map((msg: any) =>
          mapSocketToMessage(msg, currentUser, conversation)
        );

        setMessages(loadedMessages);
        setIsLoading(false);
        setShouldAutoScroll(true);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversation.id, currentUser]);

  // Fetch block status
  useEffect(() => {
    if (!conversation) return;
    const fetchBlockStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message/isBlocked/${conversation.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          setBlockStatus({
            iBlocked: data.data.iBlocked,
            blockedMe: data.data.blockedMe,
          });
        }
      } catch (err) {
        console.error("Failed to fetch block status:", err);
      }
    };
    fetchBlockStatus();
  }, [conversation]);

  // Fetch online list to check if conversation partner is online
  useEffect(() => {
    const fetchOnlineStatus = async () => {
      if (!conversation.id) return;
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message/online`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        const onlineUsers: string[] = data.data || [];
        setConversationOnline(onlineUsers.includes(conversation.id));
      } catch (err) {
        console.error("Failed to fetch online status:", err);
        setConversationOnline(false);
      }
    };
    fetchOnlineStatus();
  }, [conversation.id]);
  // -------------------------
  // Send message (optimistic UI)
  // -------------------------
  const onSendMessage = async (text: string, files?: File[]) => {
    if (!currentUser || !conversation.id) return;
    if (!text.trim() && (!files || files.length === 0)) return;

    const token = localStorage.getItem("authToken");
    const tempId = "temp-" + Date.now();

    // local preview metadata for files
    const localFilesMeta: MessageFile[] = files?.length
      ? files.map((file) => ({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: URL.createObjectURL(file), // preview only
        }))
      : [];

    // optimistic UI (temp message)
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        senderId: currentUser._id,
        receiverId: conversation.id,
        text,
        timestamp: new Date().toISOString(),
        sender: "me",
        avatar: currentUser.profileImage || "/my-avatar.png",
        files: localFilesMeta,
        _tempId: tempId, // help replacement
      },
    ]);

    scrollToBottom();

    // emit to socket with metadata
    socket.emit("send-msg", {
      tempId,
      senderId: currentUser._id,
      receiverId: conversation.id,
      messageText: text,
      replyToId: replyingMessage?.id || null,
      files: localFilesMeta.map((f) => ({
        fileName: f.fileName,
        fileType: f.fileType,
        fileSize: f.fileSize,
      })),
    });

    // send actual files to backend
    const formData = new FormData();
    formData.append("receiverId", conversation.id);
    formData.append("messageText", text);
    formData.append("tempId", tempId);
    if (replyingMessage?.id) formData.append("replyToId", replyingMessage.id);

    if (files) {
      files.forEach((file) => formData.append("files", file));
    }

    try {
      await fetch("https://matrimonial-backend-7ahc.onrender.com/api/message", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    } catch (err) {
      console.error("Failed to send message:", err);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, failedToSend: true } : m
        )
      );
    } finally {
      setReplyingMessage(null);
    }
  };
  const handleDelete = async (msgId: string) => {
    // remove temp message locally
    if (msgId.startsWith("temp-"))
      return setMessages((prev) => prev.filter((m) => m.id !== msgId));

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `https://matrimonial-backend-7ahc.onrender.com/api/message/delete/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messageId: msgId }),
        }
      );

      if (!res.ok) throw new Error("Failed to delete message");

      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      setActiveMessageId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleDeleteAllChat = async () => {
    if (!conversation.id) return;
    if (!confirm("Delete entire chat?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `https://matrimonial-backend-7ahc.onrender.com/api/message/delete/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otherUserId: conversation.id }),
        }
      );

      if (!res.ok) throw new Error("Failed to delete chat");

      setMessages([]);
      alert("Chat deleted successfully");

      socket.emit("delete-chat", {
        from: currentUser?._id,
        to: conversation.id,
      });

      setHeaderMenuOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleSubmitReport = async () => {
    if (!reportTitle.trim() || !reportDescription.trim()) {
      alert("Fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      formData.append("reportedUser", conversation.id);
      formData.append("title", reportTitle);
      formData.append("description", reportDescription);

      reportImages.forEach((img) => formData.append("image", img));

      const res = await fetch(
        "https://matrimonial-backend-7ahc.onrender.com/api/report/create",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Report Submitted.");
        setIsReportOpen(false);
        setReportTitle("");
        setReportDescription("");
        setReportImages([]);
      } else {
        alert(data.message || "Failed to submit report");
      }
    } catch (err) {
      alert("Error submitting report");
    }
  };
  // -------------------------
  // Utilities
  // -------------------------
  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const isImage = (fileType: string) =>
    fileType?.startsWith?.("image/") || fileType.includes("png") || fileType.includes("jpg");

  const handleDownload = async (url: string, name: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  // -------------------------
  // RENDER UI
  // -------------------------
  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex items-center justify-between relative">
        <button onClick={onOpenSidebar} className="md:hidden">
          ☰
        </button>

        <div className="flex items-center space-x-3">
          <div className="relative">
            {conversation.avatar ? (
              <Image
                src={conversation.avatar}
                alt={conversation.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-indigo-600 text-white grid place-items-center rounded-full">
                {conversation.name?.charAt(0).toUpperCase()}
              </div>
            )}

            {conversationOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div>
            <h2 className="font-semibold">{conversation.name}</h2>
            <p className={`${conversationOnline ? "text-green-600" : "text-gray-500"} text-sm`}>
              {conversationOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* HEADER MENU */}
        <div className="relative">
          <button
            onClick={() => setHeaderMenuOpen((p) => !p)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <MoreVertical size={20} />
          </button>

          {headerMenuOpen && (
            <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg border w-44 z-50">
              <button
                onClick={() => {
                  setHeaderMenuOpen(false);
                  setIsReportOpen(true);
                }}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
              >
                Report User
              </button>

              {!blockStatus.iBlocked ? (
                <button onClick={handleBlockUser} className="w-full px-4 py-2 text-left hover:bg-gray-100">
                  Block User
                </button>
              ) : (
                <button
                  onClick={handleUnblockUser}
                  className="w-full px-4 py-2 text-left text-yellow-700 hover:bg-gray-100"
                >
                  Unblock User
                </button>
              )}

              <button
                onClick={handleDeleteAllChat}
                className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
              >
                Delete Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* REPORT POPUP */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-5 shadow-xl">
            <h2 className="text-lg font-semibold">Report User</h2>

            <input
              className="w-full border p-2 rounded mt-3"
              placeholder="Report title (e.g. Spam)"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
            />

            <textarea
              className="w-full border p-2 rounded h-24 mt-3"
              placeholder="Describe issue"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />

            <input
              type="file"
              multiple
              accept="image/*"
              className="mt-2"
              onChange={(e) => setReportImages(Array.from(e.target.files || []))}
            />

            {reportImages.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {reportImages.map((img, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(img)}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ))}
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setIsReportOpen(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={handleSubmitReport}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGES LIST */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100"
      >
        {isLoading ? (
          <p className="text-gray-500 text-center">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === "me";

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} message-bubble`}
                onClick={() => setActiveMessageId(msg.id === activeMessageId ? null : msg.id)}
              >
                <div
                  className={`p-3 max-w-xs lg:max-w-md rounded-2xl relative ${
                    isMe ? "bg-indigo-500 text-white" : "bg-white border shadow-sm"
                  }`}
                >
                  {/* Reply preview inside bubble */}
                  {msg.replyTo && (
                    <div className="border-l-4 border-indigo-500 bg-indigo-100 text-indigo-800 p-2 rounded text-xs mb-2">
                      {msg.replyTo.text || "Media"}
                    </div>
                  )}

                  {/* TEXT */}
                  {msg.text && <p className="text-sm mb-1">{msg.text}</p>}

                  {/* FILES / IMAGES */}
                  {msg.files?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.files.map((file, i) => (
                        <div key={i} className="rounded-lg border overflow-hidden">
                          {isImage(file.fileType) ? (
                            <img
                              src={file.fileUrl}
                              className="w-full h-auto max-h-40 object-cover cursor-pointer"
                              onClick={() => window.open(file.fileUrl, "_blank")}
                            />
                          ) : (
                            <div className="bg-gray-50 p-2 flex items-center gap-3">
                              <FileText size={20} className="text-gray-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium truncate">{file.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.fileSize / 1024).toFixed(1)} KB
                                </p>
                              </div>
                              <button onClick={() => window.open(file.fileUrl, "_blank")}>
                                <Eye size={16} />
                              </button>
                              <button onClick={() => handleDownload(file.fileUrl, file.fileName)}>
                                <Download size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TIME */}
                  <p className="text-xs mt-1 opacity-70">{formatTime(msg.timestamp)}</p>

                  {/* MESSAGE ACTION MENU */}
                  {activeMessageId === msg.id && (
                    <div className="absolute top-0 right-0 bg-white shadow-lg rounded border text-sm overflow-hidden z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReply(msg);
                        }}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        Reply
                      </button>

                      {isMe && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(msg.id);
                          }}
                          className="px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* BLOCK NOTICE */}
      {blockStatus.blockedMe && (
        <div className="bg-red-200 text-red-800 p-2 text-center">You are blocked by this user</div>
      )}

      {blockStatus.iBlocked && !blockStatus.blockedMe && (
        <div className="bg-yellow-100 text-yellow-700 p-2 flex items-center justify-center gap-2">
          <span>You have blocked this user.</span>
          <button onClick={handleUnblockUser} className="underline font-semibold">
            Unblock
          </button>
        </div>
      )}

      {/* REPLY PREVIEW ABOVE INPUT */}
      {replyingMessage && (
        <div className="bg-indigo-50 px-4 py-2 border-t border-indigo-200 flex justify-between">
          <div>
            <p className="text-xs text-indigo-700">Replying to</p>
            <p className="font-medium text-indigo-900 truncate max-w-[230px]">
              {replyingMessage.text || "Media"}
            </p>
          </div>

          <button onClick={() => setReplyingMessage(null)} className="text-indigo-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* MESSAGE INPUT BOX */}
      <MessageInput
        onSendMessage={onSendMessage}
        replyingMessage={
          replyingMessage ? { text: replyingMessage.text || "", id: replyingMessage.id } : undefined
        }
        onCancelReply={() => setReplyingMessage(null)}
        disabled={blockStatus.iBlocked || blockStatus.blockedMe}
        socket={socket}
        currentUser={currentUser}
        to={conversation.id}
      />
    </div>
  );
}
