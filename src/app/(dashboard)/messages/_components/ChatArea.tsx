// ChatArea.tsx (PART 1/3)
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import MessageInput from "./MessageInput";
import { Eye, Download, FileText, MoreVertical } from "lucide-react";
import { Conversation, Message, MessageFile, SocketMessage } from "@/types/chat";
import { Socket } from "socket.io-client";

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

interface ChatAreaProps {
  conversation: Conversation;
  currentUser: User | null;
  socket: Socket;
  onOpenSidebar?: () => void;
  onMessageSent?: (conversationId: string, text: string) => void;
}

/**
 * normalize socket payload -> Message used by UI
 */
function mapSocketToMessage(
  msg: SocketMessage,
  currentUser: User,
  conversation: Conversation
): Message {
  return {
    id:
      (msg as any)._id ||
      (msg as any).tempId ||
      `msg-${msg.senderId}-${msg.receiverId}-${new Date((msg as any).createdAt || Date.now()).getTime()}`,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    text: (msg as any).messageText || "",
    timestamp: (msg as any).createdAt || new Date().toISOString(),
    sender: String(msg.senderId) === String(currentUser._id) ? "me" : "other",
    avatar:
      String(msg.senderId) === String(currentUser._id)
        ? currentUser?.profileImage || "/my-avatar.png"
        : conversation.avatar,
    files: (msg as any).files || [],
    replyTo: (msg as any).replyTo ? mapSocketToMessage((msg as any).replyTo, currentUser, conversation) : undefined,
  };
}

export default function ChatArea({
  conversation,
  currentUser,
  socket,
  onOpenSidebar,
  onMessageSent,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [blockStatus, setBlockStatus] = useState({ iBlocked: false, blockedMe: false });
  const [conversationOnline, setConversationOnline] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollTop + clientHeight >= scrollHeight - 100;
  };

  const handleScroll = () => setShouldAutoScroll(isAtBottom());

  // -------------------------
  // Socket listeners
  // -------------------------
  useEffect(() => {
    if (!socket || !currentUser || !conversation) return;

    /**
     * msg-sent: confirmation from server for messages I sent.
     * Replace optimistic messages (tempId) or append if missing.
     */
    const handleSentMessage = (msg: SocketMessage) => {
      try {
        if (String(msg.senderId) !== String(currentUser._id)) return;
        if (String(msg.receiverId) !== String(conversation.id)) return;

        setMessages((prev) => {
          const mapped = mapSocketToMessage(msg, currentUser, conversation);

          // Replace optimistic message if tempId present
          if ((msg as any).tempId) {
            return prev.map((m) => (m.id === (msg as any).tempId ? mapped : m));
          }

          // Avoid duplicate if real id exists
          if (prev.some((m) => m.id === (msg as any)._id)) return prev;

          return [...prev, mapped];
        });
      } catch (err) {
        console.error("handleSentMessage error:", err);
      }
    };

    /**
     * msg-receive: incoming message for me.
     * IMPORTANT: prevent sender (me) from processing msg-receive.
     * Many duplicate cases happen because server may broadcast back — this guards against it.
     */
    const handleIncomingMessage = (msg: SocketMessage) => {
      try {
        // Sender should never process msg-receive (ignore messages where I am sender)
        if (String(msg.senderId) === String(currentUser._id)) return;

        // Only process when I am the intended receiver
        if (String(msg.receiverId) !== String(currentUser._id)) return;

        // Only accept messages from the conversation partner
        if (String(msg.senderId) !== String(conversation.id)) return;

        setMessages((prev) => {
          if (prev.some((m) => m.id === (msg as any)._id)) return prev;
          return [...prev, mapSocketToMessage(msg, currentUser, conversation)];
        });

        setShouldAutoScroll(true);
      } catch (err) {
        console.error("handleIncomingMessage error:", err);
      }
    };

    const handleUserBlocked = (data: any) => {
      try {
        if (String(data.blockedBy) === String(conversation.id)) {
          setBlockStatus((prev) => ({ ...prev, blockedMe: true }));
        }
      } catch (e) {}
    };

    const handleUserUnblocked = (data: any) => {
      try {
        if (String(data.unblockedBy) === String(conversation.id)) {
          setBlockStatus((prev) => ({ ...prev, blockedMe: false }));
        }
      } catch (e) {}
    };

    const handleUserOnline = (userId: string) => {
      if (String(userId) === String(conversation.id)) setConversationOnline(true);
    };
    const handleUserOffline = (userId: string) => {
      if (String(userId) === String(conversation.id)) setConversationOnline(false);
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
// ChatArea.tsx (PART 2/3)
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

  // Fetch messages for conversation (initial load)
  useEffect(() => {
    if (!currentUser || !conversation) return;

    let mounted = true;
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message?currentUserId=${conversation.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        if (!mounted) return;
        const loadedMessages: Message[] = data.data.map((msg: SocketMessage) =>
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
    return () => {
      mounted = false;
    };
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
  // Send message (optimistic UI + API upload)
  // Do NOT emit socket here (server will emit after saving).
  // -------------------------
  const onSendMessage = async (text: string, files?: File[]) => {
    if (!currentUser || !conversation.id) return;
    if (!text.trim() && (!files || files.length === 0)) return;

    const token = localStorage.getItem("authToken");
    const tempId = "temp-" + Date.now();

    const localFiles =
      files?.length
        ? files.map((file) => ({
            fileName: file.name,
            fileUrl: URL.createObjectURL(file),
            fileType: file.type,
            fileSize: file.size,
          }))
        : [];

    // optimistic message (show immediately)
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        senderId: currentUser._id,
        receiverId: conversation.id,
        text,
        timestamp: new Date().toISOString(),
        sender: "me",
        avatar: currentUser.profileImage,
        files: localFiles,
        replyTo: replyingMessage || undefined,
      },
    ]);

    scrollToBottom();

    // send to backend (files + text). Backend must emit msg-sent/msg-receive
    const formData = new FormData();
    formData.append("receiverId", conversation.id);
    formData.append("messageText", text);
    formData.append("replyToId", replyingMessage?.id || "");

    files?.forEach((file) => formData.append("files", file));

    try {
      await fetch("https://matrimonial-backend-7ahc.onrender.com/api/message", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    } catch (err) {
      console.error("Failed to send message to backend:", err);
      // optional: mark as failed in UI
    } finally {
      setReplyingMessage(null);
      onMessageSent?.(conversation.id, text);
    }
  };

  // -------------------------
  // Block / Unblock / Delete chat
  // -------------------------
  const handleBlockUser = async () => {
    if (!conversation.id) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `https://matrimonial-backend-7ahc.onrender.com/api/message/block`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otherUserId: conversation.id }),
        }
      );
      if (!res.ok) throw new Error("Failed to block user");
      setBlockStatus((s) => ({ ...s, iBlocked: true }));
      alert("User blocked");
      setHeaderMenuOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleUnblockUser = async () => {
    if (!conversation.id) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `https://matrimonial-backend-7ahc.onrender.com/api/message/unblock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otherUserId: conversation.id }),
        }
      );
      if (!res.ok) throw new Error("Failed to unblock user");
      setBlockStatus((s) => ({ ...s, iBlocked: false }));
      alert("User unblocked");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteAllChat = async () => {
    if (!conversation.id) return;
    if (!confirm("Delete all chat messages?")) return;

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
      if (!res.ok) throw new Error("Failed to delete all messages");

      setMessages([]);
      alert("All messages deleted successfully");
      setHeaderMenuOpen(false);

      socket.emit("delete-chat", {
        from: currentUser?._id,
        to: conversation.id,
      });
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (msgId: string) => {
    if (msgId.startsWith("temp-")) return setMessages((prev) => prev.filter((m) => m.id !== msgId));

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
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleReply = (msg: Message) => {
    setReplyingMessage(msg);
    setActiveMessageId(null);
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const isImage = (fileType: string) => fileType.startsWith("image/");

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
// ChatArea.tsx (PART 3/3)
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex items-center justify-between relative">
        <button onClick={onOpenSidebar} className="md:hidden">☰</button>
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
              <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center">
                {conversation.name?.charAt(0).toUpperCase()}
              </div>
            )}
            {conversationOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h2 className="font-semibold">{conversation.name}</h2>
            <p className={`text-sm ${conversationOnline ? "text-green-600" : "text-gray-500"}`}>
              {conversationOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setHeaderMenuOpen((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <MoreVertical size={20} />
          </button>

          {headerMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white shadow-xl rounded-xl border z-50 overflow-hidden">
              <button
                onClick={() => {
                  alert("Report UI placeholder");
                  setHeaderMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
              >
                Report User
              </button>

              {!blockStatus.iBlocked ? (
                <button
                  onClick={handleBlockUser}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Block User
                </button>
              ) : (
                <button
                  onClick={handleUnblockUser}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-yellow-700"
                >
                  Unblock
                </button>
              )}

              <button
                onClick={handleDeleteAllChat}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
              >
                Delete Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth"
      >
        {isLoading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
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
                  className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${
                    isMe ? "bg-indigo-500 text-white" : "bg-white shadow-sm border"
                  } ${replyingMessage?.id === msg.id ? "ring-2 ring-indigo-400" : ""} relative`}
                >
                  {msg.replyTo && (
                    <div className="bg-indigo-100 text-indigo-800 p-2 rounded mb-1 border-l-4 border-indigo-500 text-xs font-medium truncate">
                      {msg.replyTo.text || "File/Media"}
                    </div>
                  )}

                  {msg.text && <p className="text-sm mb-1">{msg.text}</p>}

                  {msg.files && msg.files.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {msg.files.map((file, i) => (
                        <div key={i} className="border rounded-lg overflow-hidden relative">
                          {isImage(file.fileType) ? (
                            <img
                              src={file.fileUrl}
                              alt={file.fileName}
                              className="w-full h-auto max-h-40 object-cover cursor-pointer"
                              onClick={() => window.open(file.fileUrl, "_blank")}
                            />
                          ) : (
                            <div className="flex items-center gap-3 p-2 bg-gray-50">
                              <FileText size={20} className="text-gray-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.fileName}</p>
                                <p className="text-xs text-gray-500">{(file.fileSize / 1024).toFixed(1)} KB</p>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => window.open(file.fileUrl, "_blank")}><Eye size={14} /></button>
                                <button onClick={() => handleDownload(file.fileUrl, file.fileName)}><Download size={14} /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className={`text-xs mt-1 ${isMe ? "text-indigo-100" : "text-gray-400"}`}>{formatTime(msg.timestamp)}</p>

                  {activeMessageId === msg.id && (
                    <div className="absolute top-0 right-0 bg-white border shadow-lg rounded-md text-sm z-50 flex flex-col overflow-hidden">
                      <button
                        className="px-3 py-1 hover:bg-gray-100 text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReply(msg);
                        }}
                      >
                        Reply
                      </button>
                      {isMe && (
                        <button
                          className="px-3 py-1 hover:bg-gray-100 text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(msg.id);
                          }}
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

      {/* Block / Unblock Notice */}
      {blockStatus.blockedMe && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-2 text-center">
          You are blocked by this user
        </div>
      )}
      {blockStatus.iBlocked && !blockStatus.blockedMe && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md mb-2 text-center flex justify-center items-center gap-2">
          <span>You have blocked this user.</span>
          <button onClick={handleUnblockUser} className="text-yellow-700 underline font-semibold">Unblock</button>
        </div>
      )}

      {/* Reply preview */}
      {replyingMessage && (
        <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-200 flex items-center justify-between shadow-sm">
          <div className="flex flex-col max-w-[85%]">
            <span className="text-[11px] text-indigo-700">Replying to</span>
            <span className="text-sm font-semibold text-indigo-900 truncate">
              {replyingMessage.text || "File / Media"}
            </span>
          </div>

          <button
            onClick={() => setReplyingMessage(null)}
            className="text-indigo-500 hover:text-red-500 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Box */}
      <MessageInput
        onSendMessage={onSendMessage}
        replyingMessage={
          replyingMessage ? { text: replyingMessage.text || "", id: replyingMessage.id } : undefined
        }
        onCancelReply={() => setReplyingMessage(null)}
        disabled={blockStatus.blockedMe || blockStatus.iBlocked}
        socket={socket}
        currentUser={currentUser}
        to={conversation.id}
      />
    </div>
  );
}
