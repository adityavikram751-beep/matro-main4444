"use client";

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import Image from "next/image";
import MessageInput from "./MessageInput";
import { Eye, Download, FileText, MoreVertical } from "lucide-react";
import { Conversation, Message, SocketMessage } from "@/types/chat";

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

function mapSocketToMessage(
  msg: SocketMessage,
  currentUser: User,
  conversation: Conversation
): Message {
  return {
    id: msg._id || msg.tempId || `msg-${Date.now()}`,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    text: msg.messageText || "",
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
    status: msg.status || "sent",
    deliveredAt: msg.deliveredAt,
    readAt: msg.readAt
  };
}

export default function ChatArea({
  conversation,
  currentUser,
  socket,
  onOpenSidebar,
}: ChatAreaProps) {
  // Main state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [blockStatus, setBlockStatus] = useState({ iBlocked: false, blockedMe: false });
  const [conversationOnline, setConversationOnline] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // REPORT states
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportImages, setReportImages] = useState<File[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const hasFetchedMessagesRef = useRef(false);

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
  // SOCKET SETUP - REAL-TIME
  // -------------------------
  useEffect(() => {
    if (!socket || !currentUser || !conversation) return;

    console.log("🔄 Setting up socket for conversation:", conversation.id);

    // 1. Join user to socket
    socket.emit("add-user", currentUser._id);

    // 2. Handle MESSAGE SENT (when backend confirms)
    const handleSentMessage = (socketMsg: SocketMessage) => {
      console.log("✅ Backend confirmed message sent:", socketMsg);
      
      // Only process if it's for current conversation
      const isRelevant = 
        (socketMsg.senderId === currentUser._id && socketMsg.receiverId === conversation.id) ||
        (socketMsg.senderId === conversation.id && socketMsg.receiverId === currentUser._id);
      
      if (!isRelevant) return;

      setMessages(prev => {
        // Replace temp message with real one
        if (socketMsg.tempId) {
          const tempIndex = prev.findIndex(m => m.id === socketMsg.tempId);
          if (tempIndex !== -1) {
            const newMessages = [...prev];
            newMessages[tempIndex] = mapSocketToMessage(socketMsg, currentUser, conversation);
            return newMessages;
          }
        }
        
        // Add new message if not exists
        if (!prev.some(m => m._id === socketMsg._id)) {
          return [...prev, mapSocketToMessage(socketMsg, currentUser, conversation)];
        }
        
        return prev;
      });
      
      setShouldAutoScroll(true);
    };

    // 3. Handle INCOMING MESSAGE (from other user)
    const handleIncomingMessage = (socketMsg: SocketMessage) => {
      console.log("📩 Incoming message from socket:", socketMsg);
      
      // Check if message is for me
      if (socketMsg.receiverId === currentUser._id && socketMsg.senderId === conversation.id) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === socketMsg._id || m.id === socketMsg.tempId)) {
            return prev;
          }
          return [...prev, mapSocketToMessage(socketMsg, currentUser, conversation)];
        });
        setShouldAutoScroll(true);
      }
    };

    // 4. Handle TYPING
    const handleUserTyping = (data: any) => {
      if (data.from === conversation.id) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = (data: any) => {
      if (data.from === conversation.id) {
        setIsTyping(false);
      }
    };

    // 5. Handle ONLINE/OFFLINE
    const handleUserOnline = (userId: string) => {
      if (userId === conversation.id) setConversationOnline(true);
    };

    const handleUserOffline = (userId: string) => {
      if (userId === conversation.id) setConversationOnline(false);
    };

    // 6. Handle BLOCK/UNBLOCK
    const handleUserBlocked = (data: any) => {
      if (data.blockedBy === conversation.id) {
        setBlockStatus(prev => ({ ...prev, blockedMe: true }));
      }
    };

    const handleUserUnblocked = (data: any) => {
      if (data.unblockedBy === conversation.id) {
        setBlockStatus(prev => ({ ...prev, blockedMe: false }));
      }
    };

    // 7. Handle MESSAGE STATUS UPDATES
    const handleMessageDelivered = (data: any) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId
            ? { ...msg, status: "delivered", deliveredAt: data.deliveredAt }
            : msg
        )
      );
    };

    const handleMessageRead = (data: any) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.senderId === currentUser._id && msg.status !== "read"
            ? { ...msg, status: "read", readAt: data.readAt }
            : msg
        )
      );
    };

    // 8. Handle DELETE
    const handleMessageDeleted = (data: any) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    };

    // 9. Register all listeners
    socket.on("msg-sent", handleSentMessage);
    socket.on("msg-receive", handleIncomingMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);
    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);
    socket.on("user-blocked", handleUserBlocked);
    socket.on("user-unblocked", handleUserUnblocked);
    socket.on("message-delivered", handleMessageDelivered);
    socket.on("message-read", handleMessageRead);
    socket.on("message-deleted", handleMessageDeleted);

    return () => {
      socket.off("msg-sent", handleSentMessage);
      socket.off("msg-receive", handleIncomingMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
      socket.off("user-blocked", handleUserBlocked);
      socket.off("user-unblocked", handleUserUnblocked);
      socket.off("message-delivered", handleMessageDelivered);
      socket.off("message-read", handleMessageRead);
      socket.off("message-deleted", handleMessageDeleted);
    };
  }, [socket, currentUser, conversation]);

  // -------------------------
  // INITIAL MESSAGES FETCH
  // -------------------------
  useEffect(() => {
    if (!currentUser || !conversation || hasFetchedMessagesRef.current) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message?currentUserId=${conversation.id}`,
          { 
            headers: { 
              Authorization: `Bearer ${token}` 
            } 
          }
        );
        
        const data = await res.json();
        
        if (data.success && Array.isArray(data.data)) {
          const loadedMessages = data.data.map((msg: SocketMessage) =>
            mapSocketToMessage(msg, currentUser, conversation)
          );
          setMessages(loadedMessages);
          hasFetchedMessagesRef.current = true;
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversation.id, currentUser]);

  // Reset fetch flag when conversation changes
  useEffect(() => {
    hasFetchedMessagesRef.current = false;
  }, [conversation.id]);

  // -------------------------
  // SEND MESSAGE - OPTIMISTIC UI
  // -------------------------
  const onSendMessage = async (text: string, files?: File[]) => {
    if (!currentUser || !conversation.id || !socket) {
      alert("Cannot send message");
      return;
    }

    if (!text.trim() && (!files || files.length === 0)) {
      alert("Message cannot be empty");
      return;
    }

    console.log("📤 Sending message:", { text, filesCount: files?.length || 0 });

    const token = localStorage.getItem("authToken");
    const tempId = `temp-${Date.now()}`;

    // 1. IMMEDIATE UI UPDATE (Optimistic)
    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUser._id,
      receiverId: conversation.id,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      sender: "me",
      avatar: currentUser.profileImage,
      files: files?.map(file => ({
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        fileSize: file.size,
      })) || [],
      status: "sending",
      replyTo: replyingMessage || undefined
    };

    console.log("➕ Adding optimistic message to UI");
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();
    setReplyingMessage(null);

    try {
      // 2. SEND VIA SOCKET (Real-time)
      socket.emit("send-msg", {
        tempId,
        from: currentUser._id,
        to: conversation.id,
        messageText: text.trim(),
        replyToId: replyingMessage?.id || null,
      });

      console.log("📡 Socket emit done");

      // 3. SAVE TO DATABASE
      if (files && files.length > 0) {
        // FILE MESSAGE
        const formData = new FormData();
        formData.append("receiverId", conversation.id);
        if (replyingMessage?.id) {
          formData.append("replyToId", replyingMessage.id);
        }
        
        files.forEach((file) => {
          formData.append("file", file);
        });

        const res = await fetch(
          "https://matrimonial-backend-7ahc.onrender.com/api/message/send-file",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await res.json();
        console.log("📁 File upload response:", data);

        if (!data.success) {
          // Mark as failed if backend error
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId ? { ...msg, status: "failed" } : msg
            )
          );
        }
      } else {
        // TEXT MESSAGE
        const formData = new FormData();
        formData.append("receiverId", conversation.id);
        formData.append("messageText", text.trim());
        if (replyingMessage?.id) {
          formData.append("replyToId", replyingMessage.id);
        }

        const res = await fetch(
          "https://matrimonial-backend-7ahc.onrender.com/api/message",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await res.json();
        console.log("📝 Text message response:", data);

        if (!data.success) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId ? { ...msg, status: "failed" } : msg
            )
          );
        }
      }
    } catch (err) {
      console.error("❌ Send message error:", err);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  // -------------------------
  // TYPING INDICATOR
  // -------------------------
  const handleTyping = () => {
    if (!socket || !currentUser || !conversation.id) return;

    socket.emit("typing", {
      from: currentUser._id,
      to: conversation.id
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", {
        from: currentUser._id,
        to: conversation.id
      });
    }, 2000);
  };

  // -------------------------
  // BLOCK/UNBLOCK
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
      
      setBlockStatus({ iBlocked: true, blockedMe: false });
      setHeaderMenuOpen(false);
      
      socket.emit("block-user", {
        blockerId: currentUser?._id,
        blockedId: conversation.id
      });
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
      
      setBlockStatus({ iBlocked: false, blockedMe: false });
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  // -------------------------
  // DELETE MESSAGE
  // -------------------------
  const handleDeleteMessage = async (msgId: string) => {
    if (!msgId.startsWith("temp-")) {
      if (!confirm("Delete this message?")) return;
    }

    try {
      setMessages(prev => prev.filter(m => m.id !== msgId));
      setActiveMessageId(null);

      if (!msgId.startsWith("temp-")) {
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
        
        socket.emit("delete-message", {
          messageId: msgId,
          deletedBy: currentUser?._id
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  // -------------------------
  // UI UTILITIES
  // -------------------------
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

  const getStatusIcon = (msg: Message) => {
    if (msg.status === "failed") return "❌";
    if (msg.status === "sending") return "🔄";
    if (msg.status === "delivered") return "✓✓";
    if (msg.status === "read") return "👁✓✓";
    return "✓";
  };

  // Auto-scroll when new messages
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              <p className={`text-sm ${conversationOnline ? "text-green-600" : "text-gray-500"}`}>
                {conversationOnline ? "Online" : "Offline"}
              </p>
              {isTyping && (
                <span className="text-xs text-gray-500 italic">typing...</span>
              )}
            </div>
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
                  setIsReportOpen(true);
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
                onClick={() => {
                  if (confirm("Delete all chat messages?")) {
                    setMessages([]);
                    setHeaderMenuOpen(false);
                  }
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
              >
                Delete Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {isLoading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Start a conversation!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === "me";
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                onClick={() => setActiveMessageId(msg.id === activeMessageId ? null : msg.id)}
              >
                <div
                  className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${
                    isMe ? "bg-indigo-500 text-white" : "bg-white shadow-sm border"
                  } relative`}
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
                        <div key={i} className="border rounded-lg overflow-hidden">
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
                                <button onClick={() => window.open(file.fileUrl, "_blank")}>
                                  <Eye size={14} />
                                </button>
                                <button onClick={() => handleDownload(file.fileUrl, file.fileName)}>
                                  <Download size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs opacity-75">
                      {formatTime(msg.timestamp)}
                    </p>
                    {isMe && (
                      <span className="text-xs ml-2">
                        {getStatusIcon(msg)}
                      </span>
                    )}
                  </div>

                  {activeMessageId === msg.id && (
                    <div className="absolute top-0 right-0 bg-white border shadow-lg rounded-md text-sm z-50 flex flex-col overflow-hidden">
                      <button
                        className="px-3 py-1 hover:bg-gray-100 text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyingMessage(msg);
                          setActiveMessageId(null);
                        }}
                      >
                        Reply
                      </button>
                      {isMe && (
                        <>
                          {msg.status === "failed" && (
                            <button
                              className="px-3 py-1 hover:bg-gray-100 text-yellow-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSendMessage(msg.text, []);
                              }}
                            >
                              Retry
                            </button>
                          )}
                          <button
                            className="px-3 py-1 hover:bg-gray-100 text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(msg.id);
                            }}
                          >
                            Delete
                          </button>
                        </>
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

      {/* BLOCK NOTICES */}
      {blockStatus.blockedMe && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-center">
          You are blocked by this user
        </div>
      )}
      {blockStatus.iBlocked && !blockStatus.blockedMe && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 text-center">
          You have blocked this user
        </div>
      )}

      {/* REPLY PREVIEW */}
      {replyingMessage && (
        <div className="px-4 py-2 bg-indigo-50 flex items-center justify-between">
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

      {/* INPUT */}
      <MessageInput
        onSendMessage={onSendMessage}
        replyingMessage={
          replyingMessage
            ? { text: replyingMessage.text || "", id: replyingMessage.id }
            : undefined
        }
        onCancelReply={() => setReplyingMessage(null)}
        disabled={blockStatus.blockedMe || blockStatus.iBlocked}
        socket={socket}
        currentUser={currentUser}
        to={conversation.id}
        onTyping={handleTyping}
      />
    </div>
  );
}