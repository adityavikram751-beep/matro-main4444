"use client";

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import Image from "next/image";
import MessageInput from "./MessageInput";
import { Eye, Download, FileText, MoreVertical, Flag, X } from "lucide-react";
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
  onMessageSent: (conversationId: string, text: string) => void;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
}

function mapSocketToMessage(
  msg: SocketMessage,
  currentUser: User,
  conversation: Conversation
): Message {
  if (!msg || !currentUser) {
    return {
      id: `error-${Date.now()}`,
      senderId: '',
      receiverId: '',
      text: 'Message error',
      timestamp: new Date().toISOString(),
      sender: 'other',
      avatar: conversation?.avatar || '',
      files: [],
    };
  }

  // Fix: Check if sender is current user or conversation user
  const isMe = msg.senderId === currentUser._id;
  
  return {
    id: msg._id || msg.tempId || `msg-${msg.senderId || 'unknown'}-${msg.receiverId || 'unknown'}-${Date.now()}`,
    senderId: msg.senderId || '',
    receiverId: msg.receiverId || '',
    text: msg.messageText || '',
    timestamp: msg.createdAt || new Date().toISOString(),
    sender: isMe ? "me" : "other",
    avatar: isMe 
      ? (currentUser.profileImage || "/my-avatar.png")
      : (conversation?.avatar || ""),
    files: msg.files || [],
    replyTo: msg.replyTo
      ? mapSocketToMessage(msg.replyTo, currentUser, conversation)
      : undefined,
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

  // Report Modal States
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportImages, setReportImages] = useState<File[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const processedMessageIds = useRef(new Set<string>());

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollTop + clientHeight >= scrollHeight - 100;
  };

  const handleScroll = () => setShouldAutoScroll(isAtBottom());

  useEffect(() => {
    if (!socket || !currentUser || !conversation) return;

    // Clear processed IDs when conversation changes
    processedMessageIds.current.clear();

    const handleSentMessage = (msg: SocketMessage) => {
      if (!msg) return;

      // Check if message is for current conversation
      const isForCurrentConversation = 
        msg.receiverId === conversation.id || 
        msg.senderId === conversation.id;
      
      if (!isForCurrentConversation) return;

      // Check if message already processed
      const messageId = msg._id || msg.tempId;
      if (messageId && processedMessageIds.current.has(messageId)) {
        return;
      }
      if (messageId) {
        processedMessageIds.current.add(messageId);
      }

      setMessages((prev) => {
        // Remove temp message if exists
        if (msg.tempId) {
          const tempIndex = prev.findIndex((m) => m.id === msg.tempId);
          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = mapSocketToMessage(msg, currentUser, conversation);
            return updated;
          }
        }

        // Check if message already exists
        if (msg._id) {
          const existingIndex = prev.findIndex((m) => m.id === msg._id);
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = mapSocketToMessage(msg, currentUser, conversation);
            return updated;
          }
        }

        // Check for duplicate messages
        const isDuplicate = prev.some(m => 
          m.text === msg.messageText && 
          m.senderId === msg.senderId && 
          Math.abs(new Date(m.timestamp).getTime() - new Date(msg.createdAt || msg.timestamp).getTime()) < 1000
        );

        if (isDuplicate) {
          return prev;
        }

        return [...prev, mapSocketToMessage(msg, currentUser, conversation)];
      });
    };

    const handleIncomingMessage = (msg: SocketMessage) => {
      if (!msg || msg.senderId === currentUser._id) {
        return;
      }

      // Message should be from conversation user to current user
      const isRelevant = 
        msg.senderId === conversation.id && 
        msg.receiverId === currentUser._id;
      
      if (!isRelevant) {
        return;
      }

      // Check if message already processed
      if (msg._id && processedMessageIds.current.has(msg._id)) {
        return;
      }
      if (msg._id) {
        processedMessageIds.current.add(msg._id);
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg._id)) {
          return prev;
        }
        
        // Check for duplicate messages
        const isDuplicate = prev.some(m => 
          m.text === msg.messageText && 
          m.senderId === msg.senderId && 
          Math.abs(new Date(m.timestamp).getTime() - new Date(msg.createdAt || msg.timestamp).getTime()) < 1000
        );

        if (isDuplicate) {
          return prev;
        }

        return [...prev, mapSocketToMessage(msg, currentUser, conversation)];
      });

      setShouldAutoScroll(true);
    };

    const handleUserBlocked = (data: any) => {
      if (data.blockedBy === conversation.id) {
        setBlockStatus((prev) => ({ ...prev, blockedMe: true }));
        alert("This user has blocked you.");
      }
    };

    const handleUserUnblocked = (data: any) => {
      if (data.unblockedBy === conversation.id) {
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

    // Fix: Remove old listeners before adding new ones
    socket.off("msg-sent");
    socket.off("msg-receive");
    socket.off("user-blocked");
    socket.off("user-unblocked");
    socket.off("user-online");
    socket.off("user-offline");

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".message-bubble")) {
        setActiveMessageId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll) scrollToBottom();
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    if (conversation) {
      setShouldAutoScroll(true);
      setTimeout(() => scrollToBottom("instant"), 100);
    }
  }, [conversation.id]);

  useEffect(() => {
    if (!currentUser || !conversation) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          setIsLoading(false);
          return;
        }

        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message?currentUserId=${conversation.id}`,
          { 
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            } 
          }
        );
        
        if (!res.ok) {
          throw new Error(`Failed to fetch messages: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        
        if (!data || !Array.isArray(data.data)) {
          console.error("Invalid data structure received:", data);
          throw new Error("Invalid response data format");
        }

        // Clear processed IDs for new messages
        processedMessageIds.current.clear();

        const loadedMessages: Message[] = data.data.map((msg: SocketMessage) => {
          if (msg._id) {
            processedMessageIds.current.add(msg._id);
          }
          return mapSocketToMessage(msg, currentUser, conversation);
        });

        setMessages(loadedMessages);
        setIsLoading(false);
        setShouldAutoScroll(true);
      } catch (err: any) {
        console.error("Failed to fetch messages:", err);
        setIsLoading(false);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [conversation.id, currentUser]);

  useEffect(() => {
    if (!conversation) return;
    const fetchBlockStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message/isBlocked/${conversation.id}`,
          { 
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            } 
          }
        );
        
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setBlockStatus({
              iBlocked: data.data.iBlocked,
              blockedMe: data.data.blockedMe,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch block status:", err);
      }
    };
    fetchBlockStatus();
  }, [conversation]);

  useEffect(() => {
    const fetchOnlineStatus = async () => {
      if (!conversation.id) return;
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message/online`,
          { 
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            } 
          }
        );
        
        if (res.ok) {
          const data = await res.json();
          const onlineUsers: string[] = data.data || [];
          setConversationOnline(onlineUsers.includes(conversation.id));
        }
      } catch (err) {
        console.error("Failed to fetch online status:", err);
        setConversationOnline(false);
      }
    };
    fetchOnlineStatus();
  }, [conversation.id]);

  const onSendMessage = async (text: string, files?: File[]) => {
    if (!currentUser || !conversation.id) return;
    if (!text.trim() && (!files || files.length === 0)) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to send message");
      return;
    }

    const tempId = "temp-" + Date.now();

    const localFiles = files?.map((file) => ({
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
      fileSize: file.size,
    })) || [];

    // Add temp message
    const tempMessage: Message = {
      id: tempId,
      senderId: currentUser._id,
      receiverId: conversation.id,
      text,
      timestamp: new Date().toISOString(),
      sender: "me",
      avatar: currentUser.profileImage || "/my-avatar.png",
      files: localFiles,
    };

    setMessages((prev) => [...prev, tempMessage]);
    processedMessageIds.current.add(tempId);

    scrollToBottom();

    // Emit socket message
    socket.emit("send-msg", {
      tempId,
      from: currentUser._id,
      to: conversation.id,
      messageText: text,
      files: localFiles,
      replyToId: replyingMessage?.id || null,
    });

    try {
      const formData = new FormData();
      formData.append("receiverId", conversation.id);
      if (replyingMessage?.id) {
        formData.append("replyToId", replyingMessage.id);
      }

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
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

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            // Update temp message with server response
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempId
                  ? mapSocketToMessage(data.data, currentUser, conversation)
                  : m
              )
            );
          }
        }
      } else {
        formData.append("messageText", text);

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

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            // Update temp message with server response
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempId
                  ? mapSocketToMessage(data.data, currentUser, conversation)
                  : m
              )
            );
          }
        }
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setReplyingMessage(null);
    }
  };

  const handleBlockUser = async () => {
    if (!conversation.id) return;
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Please login first");
        return;
      }
      
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
      
      if (res.ok) {
        setBlockStatus({ ...blockStatus, iBlocked: true });
        alert("User blocked");
        setHeaderMenuOpen(false);
      } else {
        alert("Failed to block user");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleUnblockUser = async () => {
    if (!conversation.id) return;
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Please login first");
        return;
      }
      
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
      
      if (res.ok) {
        setBlockStatus({ ...blockStatus, iBlocked: false });
        alert("User unblocked");
      } else {
        alert("Failed to unblock user");
      }
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
      if (!token) {
        alert("Please login first");
        return;
      }
      
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
      
      if (res.ok) {
        setMessages([]);
        processedMessageIds.current.clear();
        alert("All messages deleted successfully");
        setHeaderMenuOpen(false);

        socket.emit("delete-chat", {
          from: currentUser?._id,
          to: conversation.id,
        });
      } else {
        alert("Failed to delete all messages");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (msgId: string) => {
    if (msgId.startsWith("temp-")) {
      return setMessages((prev) => prev.filter((m) => m.id !== msgId));
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Please login first");
        return;
      }
      
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
      
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        setActiveMessageId(null);
      } else {
        alert("Failed to delete message");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleReply = (msg: Message) => {
    setReplyingMessage(msg);
    setActiveMessageId(null);
  };

  // REPORT SUBMIT FUNCTION
  const handleSubmitReport = async () => {
    if (!reportTitle.trim() || !reportDescription.trim()) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmittingReport(true);
    setReportSuccess(false);

    try {
      const token = localStorage.getItem("authToken");
      const reporterId = currentUser?._id;
      const reportedUserId = conversation.id;

      if (!reporterId) {
        alert("Please login to submit report");
        return;
      }

      const formData = new FormData();
      formData.append("reporter", reporterId);
      formData.append("reportedUser", reportedUserId);
      formData.append("title", reportTitle);
      formData.append("description", reportDescription);

      reportImages.forEach((img, index) => {
        formData.append("image", img);
      });

      const res = await fetch(
        "https://matrimonial-backend-7ahc.onrender.com/api/report/create",
        {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReportSuccess(true);
          setTimeout(() => {
            setIsReportOpen(false);
            setReportTitle("");
            setReportDescription("");
            setReportImages([]);
            setReportSuccess(false);
          }, 2000);
        } else {
          alert(data.message || "Failed to submit report");
        }
      } else {
        alert("Failed to submit report");
      }
    } catch (err) {
      console.error("Report submission error:", err);
      alert("An error occurred while submitting the report");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const isImage = (fileType: string) => fileType.startsWith("image/");

  // FIXED Download function - Works for all file types
  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      // Check if it's a blob URL (local file)
      if (fileUrl.startsWith('blob:')) {
        // For blob URLs, create download directly
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // For server URLs, fetch with proper headers
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
        mode: 'cors',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: Try to open in new tab
      try {
        window.open(fileUrl, '_blank');
      } catch (fallbackError) {
        alert(`Unable to download "${fileName}". You can try right-clicking and selecting "Save as".`);
      }
    }
  };

  // FIXED: Show avatar properly
  const getAvatar = (msg: Message) => {
    if (msg.sender === "me") {
      return currentUser?.profileImage || "/my-avatar.png";
    } else {
      return conversation.avatar || "";
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div
        className="bg-white border-b border-gray-200 p-4 shadow-sm flex items-center justify-between relative
                   max-md:fixed max-md:top-[56px] max-md:left-0 max-md:right-0 max-md:z-40"
      >
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
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border z-50 overflow-hidden">
              {/* REPORT BUTTON */}
              <button
                onClick={() => {
                  setIsReportOpen(true);
                  setHeaderMenuOpen(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
              >
                <Flag size={16} className="mr-2" />
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
          <p className="text-center text-gray-500">No messages yet. Start a conversation!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === "me";
            const avatarUrl = getAvatar(msg);
            
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 message-bubble`}
                onClick={() => setActiveMessageId(msg.id === activeMessageId ? null : msg.id)}
              >
                {!isMe && avatarUrl && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {avatarUrl.startsWith('http') || avatarUrl.startsWith('/') ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-indigo-500 text-white flex items-center justify-center text-sm">
                        {conversation.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                
                <div
                  className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${
                    isMe ? "bg-indigo-500 text-white rounded-tr-none" : "bg-white shadow-sm border rounded-tl-none"
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
                            <div className="relative">
                              <img
                                src={file.fileUrl}
                                alt={file.fileName}
                                className="w-full h-auto max-h-40 object-cover cursor-pointer"
                                onClick={() => window.open(file.fileUrl, "_blank")}
                              />
                              <div className="absolute bottom-2 right-2 flex gap-1 bg-black/50 p-1 rounded">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(file.fileUrl, "_blank");
                                  }}
                                  className="p-1 bg-white/20 rounded hover:bg-white/30 transition"
                                  title="View full image"
                                >
                                  <Eye size={14} className="text-white" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file.fileUrl, file.fileName);
                                  }}
                                  className="p-1 bg-white/20 rounded hover:bg-white/30 transition"
                                  title="Download image"
                                >
                                  <Download size={14} className="text-white" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-gray-50">
                              <FileText size={24} className="text-indigo-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => window.open(file.fileUrl, "_blank")}
                                  className="p-1 hover:bg-gray-200 rounded transition"
                                  title="View file"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDownload(file.fileUrl, file.fileName)}
                                  className="p-1 hover:bg-gray-200 rounded transition"
                                  title="Download file"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className={`text-xs mt-1 ${isMe ? "text-indigo-200" : "text-gray-500"}`}>
                    {formatTime(msg.timestamp)}
                  </p>

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

                {isMe && avatarUrl && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {avatarUrl.startsWith('http') || avatarUrl.startsWith('/') ? (
                      <Image
                        src={avatarUrl}
                        alt="My Avatar"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-indigo-500 text-white flex items-center justify-center text-sm">
                        {currentUser?.firstName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
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

      {/* Instagram Style Reply Preview */}
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
          replyingMessage
            ? { text: replyingMessage.text || "", id: replyingMessage.id }
            : undefined
        }
        onCancelReply={() => setReplyingMessage(null)}
        disabled={blockStatus.blockedMe || blockStatus.iBlocked}
        socket={socket}
        currentUser={currentUser}
        to={conversation.id}
      />

      {/* REPORT POPUP MODAL - CHAT SCREEN PER KHULEGA */}
      {isReportOpen && (
        <div className="absolute inset-0 bg-white bg-opacity-100 z-50 flex flex-col">
          {/* Modal Header - Chat Screen wali header ke niche */}
          <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsReportOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ←
              </button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Report User</h3>
                <p className="text-sm text-gray-500">Reporting: {conversation.name}</p>
              </div>
            </div>
            <button
              onClick={() => setIsReportOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
              disabled={isSubmittingReport}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body - Full screen chat area ki jagah */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-2xl mx-auto space-y-6">
              {reportSuccess ? (
                <div className="bg-green-50 text-green-700 p-6 rounded-lg text-center mt-10">
                  <div className="text-xl font-semibold mb-3">✓ Report Submitted Successfully!</div>
                  <p className="text-sm">Your report has been received and will be reviewed by our team.</p>
                  <button
                    onClick={() => setIsReportOpen(false)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {/* Title/Reason */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Report *
                    </label>
                    <select
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      required
                      disabled={isSubmittingReport}
                    >
                      <option value="">Select a reason</option>
                      <option value="spam">Spam</option>
                      <option value="inappropriate">Inappropriate Content</option>
                      <option value="harassment">Harassment</option>
                      <option value="fake">Fake Profile</option>
                      <option value="scam">Scam/Fraud</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Please provide detailed information about the issue..."
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                      required
                      disabled={isSubmittingReport}
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach Proof Images (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-300 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setReportImages(Array.from(e.target.files || []))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isSubmittingReport}
                      />
                      <div className="text-gray-500">
                        <p className="text-sm font-medium mb-1">Drag & drop or click to upload</p>
                        <p className="text-xs">PNG, JPG, GIF up to 5MB each</p>
                      </div>
                    </div>

                    {reportImages.length > 0 && (
                      <div className="mt-4 flex gap-3 flex-wrap">
                        {reportImages.map((img, i) => (
                          <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                            <img
                              src={URL.createObjectURL(img)}
                              className="w-full h-full object-cover"
                              alt={`proof-${i}`}
                            />
                            <button
                              onClick={() => setReportImages(reportImages.filter((_, idx) => idx !== i))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-600 transition-colors"
                              disabled={isSubmittingReport}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Important Note */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Note:</span> False reporting may result in account suspension. Please provide accurate information.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Modal Footer - Fixed at bottom */}
          <div className="border-t bg-white p-4">
            <div className="max-w-2xl mx-auto flex justify-between items-center">
              <button
                onClick={() => setIsReportOpen(false)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                disabled={isSubmittingReport}
              >
                Cancel
              </button>
              {!reportSuccess && (
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmittingReport || !reportTitle.trim() || !reportDescription.trim()}
                  className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmittingReport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}