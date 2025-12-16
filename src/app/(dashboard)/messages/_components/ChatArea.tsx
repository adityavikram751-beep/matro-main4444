"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Socket } from "socket.io-client";
import Image from "next/image";
import MessageInput from "./MessageInput";
import { Eye, Download, FileText, MoreVertical, Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { Conversation, Message, SocketMessage, MessageStatus } from "@/types/chat";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  onlineStatus?: "online" | "offline";
  lastSeen?: string;
}

interface ChatAreaProps {
  conversation: Conversation;
  currentUser: User | null;
  socket: Socket;
  onOpenSidebar: () => void;
}

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://matrimonial-backend-7ahc.onrender.com";
const SOCKET_EVENTS = {
  MSG_SENT: "msg-sent",
  MSG_RECEIVE: "msg-receive",
  USER_TYPING: "user-typing",
  USER_STOP_TYPING: "user-stop-typing",
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  USER_BLOCKED: "user-blocked",
  USER_UNBLOCKED: "user-unblocked",
  MESSAGE_DELIVERED: "message-delivered",
  MESSAGE_READ: "message-read",
  MESSAGE_DELETED: "message-deleted",
  CHAT_DELETED: "chat-deleted",
  ERROR: "error",
  ONLINE_USERS_UPDATE: "online-users-update",
  USER_ADDED: "user-added"
} as const;

function mapSocketToMessage(
  msg: SocketMessage,
  currentUser: User,
  conversation: Conversation
): Message {
  return {
    id: msg._id || msg.tempId || `msg-${Date.now()}`,
    _id: msg._id,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    text: msg.messageText || "",
    timestamp: msg.createdAt || new Date().toISOString(),
    createdAt: msg.createdAt || new Date().toISOString(),
    sender: msg.senderId === currentUser._id ? "me" : "other",
    avatar: 
      msg.senderId === currentUser._id
        ? currentUser.profileImage || "/my-avatar.png"
        : conversation.avatar,
    files: msg.files || [],
    replyTo: msg.replyTo
      ? {
          id: msg.replyTo._id,
          text: msg.replyTo.messageText || "",
          files: msg.replyTo.files || []
        }
      : undefined,
    status: (msg.status as MessageStatus) || "sent",
    deliveredAt: msg.deliveredAt,
    readAt: msg.readAt,
    conversationId: msg.conversationId,
    tempId: msg.tempId
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
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [conversationLastSeen, setConversationLastSeen] = useState<string | null>(null);

  // REPORT states
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportImages, setReportImages] = useState<File[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const observerRef = useRef<IntersectionObserver>();
  const messagePageRef = useRef(0);
  const MESSAGES_PER_PAGE = 50;

  // Memoized values
  const conversationId = useMemo(() => 
    conversation.id ? [currentUser?._id, conversation.id].sort().join("_") : "",
    [currentUser?._id, conversation.id]
  );

  const currentUserId = currentUser?._id;

  // Helper functions
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const isAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollTop + clientHeight >= scrollHeight - 100;
  }, []);

  const handleScroll = () => {
    setShouldAutoScroll(isAtBottom());
    
    // Load more messages when scrolled to top
    if (messagesContainerRef.current?.scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  // Socket setup with backend alignment
  useEffect(() => {
    if (!socket || !currentUserId || !conversation.id) return;

    console.log("🔄 Setting up socket for conversation:", conversation.id);

    // 1. Join user to socket (matches backend "add-user")
    socket.emit("add-user", currentUserId);

    // Socket event handlers
    const handleSentMessage = (socketMsg: SocketMessage) => {
      console.log("✅ Backend confirmed message sent:", socketMsg);
      
      if (![socketMsg.senderId, socketMsg.receiverId].includes(conversation.id)) return;

      setMessages(prev => {
        // Replace temp message
        if (socketMsg.tempId) {
          const tempIndex = prev.findIndex(m => m.id === socketMsg.tempId);
          if (tempIndex !== -1) {
            const newMessages = [...prev];
            newMessages[tempIndex] = mapSocketToMessage(socketMsg, currentUser!, conversation);
            return newMessages;
          }
        }
        
        // Add if not exists
        if (!prev.some(m => m._id === socketMsg._id)) {
          return [...prev, mapSocketToMessage(socketMsg, currentUser!, conversation)];
        }
        
        return prev;
      });
      
      setShouldAutoScroll(true);
    };

    const handleIncomingMessage = (socketMsg: SocketMessage) => {
      console.log("📩 Incoming message:", socketMsg);
      
      if (socketMsg.receiverId === currentUserId && socketMsg.senderId === conversation.id) {
        setMessages(prev => {
          if (prev.some(m => m._id === socketMsg._id)) return prev;
          return [...prev, mapSocketToMessage(socketMsg, currentUser!, conversation)];
        });
        setShouldAutoScroll(true);
        
        // Mark as delivered automatically (backend does this for online users)
        if (socketMsg.status !== "delivered") {
          socket.emit("message-delivered", {
            messageId: socketMsg._id,
            conversationId: socketMsg.conversationId,
            deliveredAt: new Date()
          });
        }
      }
    };

    const handleUserTyping = (data: { from: string }) => {
      if (data.from === conversation.id) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = (data: { from: string }) => {
      if (data.from === conversation.id) {
        setIsTyping(false);
      }
    };

    const handleUserOnline = (userId: string) => {
      if (userId === conversation.id) {
        setConversationOnline(true);
        setConversationLastSeen(null);
      }
    };

    const handleUserOffline = (userId: string) => {
      if (userId === conversation.id) {
        setConversationOnline(false);
        // Fetch last seen from API
        fetchLastSeen();
      }
    };

    const handleUserBlocked = (data: { blockedBy: string }) => {
      if (data.blockedBy === conversation.id) {
        setBlockStatus(prev => ({ ...prev, blockedMe: true }));
      }
    };

    const handleUserUnblocked = (data: { unblockedBy: string }) => {
      if (data.unblockedBy === conversation.id) {
        setBlockStatus(prev => ({ ...prev, blockedMe: false }));
      }
    };

    const handleMessageDelivered = (data: { messageId: string; deliveredAt: string }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === data.messageId
            ? { ...msg, status: "delivered", deliveredAt: data.deliveredAt }
            : msg
        )
      );
    };

    const handleMessageRead = (data: { conversationId: string; readerId: string }) => {
      if (data.conversationId === conversationId) {
        // Mark all messages sent by current user as read
        setMessages(prev =>
          prev.map(msg =>
            msg.senderId === currentUserId && msg.status !== "read"
              ? { ...msg, status: "read", readAt: new Date().toISOString() }
              : msg
          )
        );
      }
    };

    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    };

    const handleChatDeleted = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        setMessages([]);
        alert("Chat was deleted by the other user");
      }
    };

    const handleOnlineUsersUpdate = (userIds: string[]) => {
      setOnlineUsers(userIds);
      setConversationOnline(userIds.includes(conversation.id));
    };

    const handleUserAdded = (data: { userId: string; onlineUsers: string[] }) => {
      if (data.userId === currentUserId) {
        setOnlineUsers(data.onlineUsers);
        setConversationOnline(data.onlineUsers.includes(conversation.id));
      }
    };

    const handleSocketError = (error: { message: string }) => {
      console.error("Socket error:", error);
      // Show user-friendly error
    };

    // Register all socket listeners
    socket.on(SOCKET_EVENTS.MSG_SENT, handleSentMessage);
    socket.on(SOCKET_EVENTS.MSG_RECEIVE, handleIncomingMessage);
    socket.on(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
    socket.on(SOCKET_EVENTS.USER_STOP_TYPING, handleUserStopTyping);
    socket.on(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
    socket.on(SOCKET_EVENTS.USER_BLOCKED, handleUserBlocked);
    socket.on(SOCKET_EVENTS.USER_UNBLOCKED, handleUserUnblocked);
    socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, handleMessageDelivered);
    socket.on(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
    socket.on(SOCKET_EVENTS.CHAT_DELETED, handleChatDeleted);
    socket.on(SOCKET_EVENTS.ONLINE_USERS_UPDATE, handleOnlineUsersUpdate);
    socket.on(SOCKET_EVENTS.USER_ADDED, handleUserAdded);
    socket.on(SOCKET_EVENTS.ERROR, handleSocketError);

    // Cleanup
    return () => {
      socket.off(SOCKET_EVENTS.MSG_SENT, handleSentMessage);
      socket.off(SOCKET_EVENTS.MSG_RECEIVE, handleIncomingMessage);
      socket.off(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
      socket.off(SOCKET_EVENTS.USER_STOP_TYPING, handleUserStopTyping);
      socket.off(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
      socket.off(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
      socket.off(SOCKET_EVENTS.USER_BLOCKED, handleUserBlocked);
      socket.off(SOCKET_EVENTS.USER_UNBLOCKED, handleUserUnblocked);
      socket.off(SOCKET_EVENTS.MESSAGE_DELIVERED, handleMessageDelivered);
      socket.off(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
      socket.off(SOCKET_EVENTS.CHAT_DELETED, handleChatDeleted);
      socket.off(SOCKET_EVENTS.ONLINE_USERS_UPDATE, handleOnlineUsersUpdate);
      socket.off(SOCKET_EVENTS.USER_ADDED, handleUserAdded);
      socket.off(SOCKET_EVENTS.ERROR, handleSocketError);
    };
  }, [socket, currentUser, conversation.id, currentUserId, conversationId]);

  // Fetch initial messages
  useEffect(() => {
    if (!currentUserId || !conversation.id) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        
        const res = await fetch(
          `${API_BASE_URL}/api/message?currentUserId=${conversation.id}&limit=${MESSAGES_PER_PAGE}&skip=0`,
          { 
            headers: { 
              Authorization: `Bearer ${token}` 
            } 
          }
        );
        
        const data = await res.json();
        
        if (data.success && Array.isArray(data.data)) {
          const loadedMessages = data.data.map((msg: SocketMessage) =>
            mapSocketToMessage(msg, currentUser!, conversation)
          );
          setMessages(loadedMessages);
          setHasMoreMessages(data.data.length === MESSAGES_PER_PAGE);
          messagePageRef.current = 1;
          
          // Mark messages as read
          if (loadedMessages.length > 0) {
            markMessagesAsRead();
          }
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversation.id, currentUserId, currentUser, conversation]);

  // Fetch more messages (infinite scroll)
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMoreMessages || !currentUserId || !conversation.id) return;

    try {
      setIsLoadingMore(true);
      const token = localStorage.getItem("authToken");
      const skip = messagePageRef.current * MESSAGES_PER_PAGE;
      
      const res = await fetch(
        `${API_BASE_URL}/api/message?currentUserId=${conversation.id}&limit=${MESSAGES_PER_PAGE}&skip=${skip}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        const newMessages = data.data.map((msg: SocketMessage) =>
          mapSocketToMessage(msg, currentUser!, conversation)
        );
        
        setMessages(prev => [...newMessages, ...prev]);
        setHasMoreMessages(data.data.length === MESSAGES_PER_PAGE);
        messagePageRef.current += 1;
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Fetch last seen information
  const fetchLastSeen = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${API_BASE_URL}/api/message/online?userId=${conversation.id}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      
      const data = await res.json();
      if (data.success) {
        setConversationLastSeen(data.lastSeen);
      }
    } catch (err) {
      console.error("Failed to fetch last seen:", err);
    }
  };

  // Check block status
  useEffect(() => {
    const checkBlockStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${API_BASE_URL}/api/message/isBlocked/${conversation.id}`,
          { 
            headers: { 
              Authorization: `Bearer ${token}` 
            } 
          }
        );
        
        const data = await res.json();
        if (data.success) {
          setBlockStatus({
            iBlocked: data.iBlocked || false,
            blockedMe: data.blockedMe || false
          });
        }
      } catch (err) {
        console.error("Failed to check block status:", err);
      }
    };

    if (conversation.id && currentUserId) {
      checkBlockStatus();
    }
  }, [conversation.id, currentUserId]);

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await fetch(`${API_BASE_URL}/api/message/markAsRead`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          conversationId,
          otherUserId: conversation.id 
        }),
      });

      // Also emit socket event for real-time update
      socket.emit("message-read-ack", {
        conversationId,
        readerId: currentUserId,
        otherUserId: conversation.id
      });
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  // Message sending with backend alignment
  const onSendMessage = async (text: string, files?: File[]) => {
    if (!currentUser || !conversation.id || !socket) {
      alert("Cannot send message");
      return;
    }

    if (!text.trim() && (!files || files.length === 0)) {
      alert("Message cannot be empty");
      return;
    }

    const token = localStorage.getItem("authToken");
    const tempId = `temp-${Date.now()}`;

    // Optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      _id: tempId,
      senderId: currentUser._id,
      receiverId: conversation.id,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      sender: "me",
      avatar: currentUser.profileImage,
      files: files?.map(file => ({
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        fileSize: file.size,
      })) || [],
      status: "sending",
      replyTo: replyingMessage ? {
        id: replyingMessage._id || replyingMessage.id,
        text: replyingMessage.text || "",
        files: replyingMessage.files || []
      } : undefined,
      conversationId
    };

    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();
    setReplyingMessage(null);

    try {
      // Use socket for text messages (matches backend)
      if (files && files.length > 0) {
        // Handle file upload via API
        const formData = new FormData();
        formData.append("receiverId", conversation.id);
        if (replyingMessage?.id) {
          formData.append("replyToId", replyingMessage.id.replace('temp-', ''));
        }
        
        files.forEach((file) => {
          formData.append("file", file);
        });

        const res = await fetch(
          `${API_BASE_URL}/api/message/send-file`,
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
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId ? { ...msg, status: "failed" } : msg
            )
          );
        }
      } else {
        // Send text message via socket (backend expects this)
        socket.emit("send-msg", {
          tempId,
          from: currentUser._id,
          to: conversation.id,
          messageText: text.trim(),
          replyToId: replyingMessage?.id?.replace('temp-', '') || null,
        });

        console.log("📡 Socket emit done for text message");
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

  // Typing indicator
  const handleTyping = () => {
    if (!socket || !currentUserId || !conversation.id) return;

    socket.emit("typing", {
      from: currentUserId,
      to: conversation.id
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", {
        from: currentUserId,
        to: conversation.id
      });
    }, 2000);
  };

  // Block/Unblock user
  const handleBlockUser = async () => {
    if (!conversation.id) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${API_BASE_URL}/api/message/block`,
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
        setBlockStatus({ iBlocked: true, blockedMe: false });
        setHeaderMenuOpen(false);
        
        socket.emit("block-user", {
          blockerId: currentUserId,
          blockedId: conversation.id
        });
      } else {
        throw new Error("Failed to block user");
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
      const res = await fetch(
        `${API_BASE_URL}/api/message/unblock`,
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
        setBlockStatus({ iBlocked: false, blockedMe: false });
        setHeaderMenuOpen(false);
        
        socket.emit("unblock-user", {
          unblockerId: currentUserId,
          unblockedId: conversation.id
        });
      } else {
        throw new Error("Failed to unblock user");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  // Delete message
  const handleDeleteMessage = async (msgId: string) => {
    if (msgId.startsWith("temp-")) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
      setActiveMessageId(null);
      return;
    }

    if (!confirm("Delete this message?")) return;

    try {
      const token = localStorage.getItem("authToken");
      await fetch(
        `${API_BASE_URL}/api/message/delete/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messageId: msgId }),
        }
      );
      
      setMessages(prev => prev.filter(m => m.id !== msgId));
      setActiveMessageId(null);

      socket.emit("delete-message", {
        messageId: msgId,
        deletedBy: currentUserId
      });
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  // Delete entire chat
  const handleDeleteChat = async () => {
    if (!confirm("Delete entire chat? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("authToken");
      await fetch(
        `${API_BASE_URL}/api/message/delete/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ conversationId }),
        }
      );
      
      setMessages([]);
      setHeaderMenuOpen(false);

      socket.emit("delete-chat", {
        conversationId,
        deletedBy: currentUserId,
        otherUserId: conversation.id
      });
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  // Helper functions
  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (timestamp: string) =>
    new Date(timestamp).toLocaleDateString();

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
      alert("Failed to download file");
    }
  };

  const getStatusIcon = (msg: Message) => {
    switch (msg.status) {
      case "failed":
        return <AlertCircle size={14} className="text-red-500" />;
      case "sending":
        return <Clock size={14} className="text-gray-400" />;
      case "delivered":
        return <CheckCheck size={14} className="text-gray-500" />;
      case "read":
        return <CheckCheck size={14} className="text-blue-500" />;
      default:
        return <Check size={14} className="text-gray-400" />;
    }
  };

  const getOnlineStatusText = () => {
    if (conversationOnline) return "Online";
    if (conversationLastSeen) {
      const lastSeen = new Date(conversationLastSeen);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 1) return `Last seen ${Math.floor(diffHours * 60)} minutes ago`;
      if (diffHours < 24) return `Last seen ${diffHours} hours ago`;
      return `Last seen ${formatDate(conversationLastSeen)}`;
    }
    return "Offline";
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";
    
    messages.forEach(msg => {
      const msgDate = formatDate(msg.timestamp);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: currentDate, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    });
    
    return groups;
  }, [messages]);

  // Render
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={onOpenSidebar} 
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Open sidebar"
        >
          <span className="text-xl">☰</span>
        </button>

        <div className="flex items-center space-x-3 flex-1">
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
              <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                {conversation.name?.charAt(0).toUpperCase()}
              </div>
            )}
            {conversationOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{conversation.name}</h2>
            <div className="flex items-center gap-2">
              <p className={`text-sm ${conversationOnline ? "text-green-600" : "text-gray-500"}`}>
                {getOnlineStatusText()}
              </p>
              {isTyping && (
                <span className="text-xs text-indigo-500 italic animate-pulse">typing...</span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setHeaderMenuOpen((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="More options"
            aria-expanded={headerMenuOpen}
          >
            <MoreVertical size={20} />
          </button>

          {headerMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setHeaderMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setIsReportOpen(true);
                    setHeaderMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-red-600 border-b"
                >
                  ⚠️ Report User
                </button>

                {!blockStatus.iBlocked ? (
                  <button
                    onClick={handleBlockUser}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700"
                  >
                    🚫 Block User
                  </button>
                ) : (
                  <button
                    onClick={handleUnblockUser}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-yellow-700"
                  >
                    ✅ Unblock User
                  </button>
                )}

                <button
                  onClick={handleDeleteChat}
                  className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-red-500"
                >
                  🗑️ Delete Chat
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        ) : (
          <>
            {isLoadingMore && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
              </div>
            )}
            
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                    {group.date}
                  </span>
                </div>
                {group.messages.map((msg) => {
                  const isMe = msg.sender === "me";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
                      onClick={() => setActiveMessageId(msg.id === activeMessageId ? null : msg.id)}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${
                          isMe 
                            ? "bg-indigo-500 text-white rounded-tr-none" 
                            : "bg-white text-gray-900 shadow-sm border rounded-tl-none"
                        } relative group`}
                      >
                        {/* Reply Preview */}
                        {msg.replyTo && (
                          <div className={`mb-2 p-2 rounded-lg border-l-3 ${
                            isMe ? "bg-indigo-400 border-indigo-300" : "bg-gray-100 border-gray-300"
                          }`}>
                            <p className="text-xs font-medium truncate">
                              {msg.replyTo.text ? `"${msg.replyTo.text}"` : "File/Media"}
                            </p>
                          </div>
                        )}

                        {/* Message Text */}
                        {msg.text && <p className="text-sm mb-2 whitespace-pre-wrap break-words">{msg.text}</p>}

                        {/* Files */}
                        {msg.files && msg.files.length > 0 && (
                          <div className="space-y-2 mb-2">
                            {msg.files.map((file, i) => (
                              <div key={i} className="border rounded-lg overflow-hidden bg-black/5">
                                {isImage(file.fileType) ? (
                                  <div className="relative">
                                    <img
                                      src={file.fileUrl}
                                      alt={file.fileName}
                                      className="w-full h-auto max-h-60 object-cover cursor-pointer"
                                      onClick={() => window.open(file.fileUrl, "_blank")}
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                      {file.fileType.split('/')[1]?.toUpperCase()}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 p-3">
                                    <FileText size={24} className="text-gray-600" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{file.fileName}</p>
                                      <p className="text-xs text-gray-500">
                                        {(file.fileSize / 1024).toFixed(1)} KB • {file.fileType}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(file.fileUrl, "_blank");
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Preview"
                                      >
                                        <Eye size={16} />
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownload(file.fileUrl, file.fileName);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Download"
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

                        {/* Timestamp & Status */}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-75">
                            {formatTime(msg.timestamp)}
                          </p>
                          {isMe && (
                            <span className="ml-2">
                              {getStatusIcon(msg)}
                            </span>
                          )}
                        </div>

                        {/* Message Actions Menu */}
                        {activeMessageId === msg.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setActiveMessageId(null)}
                            />
                            <div className="absolute top-0 right-0 mt-8 bg-white border shadow-lg rounded-md text-sm z-50 flex flex-col overflow-hidden min-w-32">
                              <button
                                className="px-4 py-2 hover:bg-gray-100 text-left text-gray-700 flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReplyingMessage(msg);
                                  setActiveMessageId(null);
                                }}
                              >
                                <span>↩️</span> Reply
                              </button>
                              {isMe && (
                                <>
                                  {msg.status === "failed" && (
                                    <button
                                      className="px-4 py-2 hover:bg-gray-100 text-left text-yellow-600 flex items-center gap-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSendMessage(msg.text, []);
                                        setActiveMessageId(null);
                                      }}
                                    >
                                      <span>🔄</span> Retry
                                    </button>
                                  )}
                                  <button
                                    className="px-4 py-2 hover:bg-gray-100 text-left text-red-500 flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMessage(msg.id);
                                    }}
                                  >
                                    <span>🗑️</span> Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* BLOCK NOTICES */}
      {blockStatus.blockedMe && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-center">
          ⚠️ You are blocked by this user. You cannot send messages.
        </div>
      )}
      {blockStatus.iBlocked && !blockStatus.blockedMe && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 text-center">
          ⚠️ You have blocked this user. Unblock to send messages.
        </div>
      )}

      {/* REPLY PREVIEW */}
      {replyingMessage && (
        <div className="px-4 py-3 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-indigo-700 mb-1 block">Replying to</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-indigo-600">↩️</span>
              </div>
              <span className="text-sm font-medium text-indigo-900 truncate">
                {replyingMessage.text || (replyingMessage.files?.length ? `File (${replyingMessage.files.length})` : "Media")}
              </span>
            </div>
          </div>
          <button
            onClick={() => setReplyingMessage(null)}
            className="text-indigo-500 hover:text-red-500 font-bold p-1"
            aria-label="Cancel reply"
          >
            ✕
          </button>
        </div>
      )}

      {/* MESSAGE INPUT */}
      <MessageInput
        onSendMessage={onSendMessage}
        replyingMessage={
          replyingMessage
            ? { 
                text: replyingMessage.text || "", 
                id: replyingMessage.id,
                sender: replyingMessage.sender
              }
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