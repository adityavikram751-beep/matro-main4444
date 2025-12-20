"use client";

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import Image from "next/image";
import MessageInput from "./MessageInput";
import { Eye, Download, FileText, MoreVertical, Flag, X, Phone, Video, PhoneOff } from "lucide-react";
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
  return {
    id: msg._id || msg.tempId || `msg-${msg.senderId}-${msg.receiverId}-${Date.now()}`,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    text: msg.messageText,
    timestamp: msg.createdAt || new Date().toISOString(),
    sender: msg.senderId === currentUser._id ? "me" : "other",
    avatar:
      msg.senderId === currentUser._id
        ? currentUser.profileImage || "/my-avatar.png"
        : conversation.avatar,
    files: msg.files,
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

  // Calling States
  const [isCalling, setIsCalling] = useState(false);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected' | 'ended'>('idle');

  // Report Modal States
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportImages, setReportImages] = useState<File[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

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

  // HELPER FUNCTIONS
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
  };

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

  // Initialize socket listeners for calling
  useEffect(() => {
    if (!socket || !currentUser) return;

    // Handle incoming voice call
    const handleIncomingVoiceCall = (data: any) => {
      if (data.to === currentUser._id) {
        setIncomingCall({
          from: data.from,
          type: 'voice',
          callerName: data.callerName || 'Someone',
          callId: data.callId
        });
        setCallStatus('ringing');
        
        // Play ringtone
        playRingtone();
      }
    };

    // Handle incoming video call
    const handleIncomingVideoCall = (data: any) => {
      if (data.to === currentUser._id) {
        setIncomingCall({
          from: data.from,
          type: 'video',
          callerName: data.callerName || 'Someone',
          callId: data.callId
        });
        setCallStatus('ringing');
        
        // Play ringtone
        playRingtone();
      }
    };

    // Handle call accepted
    const handleCallAccepted = (data: any) => {
      if (data.to === currentUser._id && data.callId === incomingCall?.callId) {
        setCallStatus('connected');
        stopRingtone();
      }
    };

    // Handle call rejected
    const handleCallRejected = (data: any) => {
      if (data.to === currentUser._id) {
        setCallStatus('ended');
        setIncomingCall(null);
        setIsCalling(false);
        setIsVideoCalling(false);
        stopRingtone();
        alert("Call was rejected");
      }
    };

    // Handle call ended
    const handleCallEnded = (data: any) => {
      if (data.to === currentUser._id || data.from === currentUser._id) {
        setCallStatus('ended');
        setIncomingCall(null);
        setIsCalling(false);
        setIsVideoCalling(false);
        stopRingtone();
      }
    };

    socket.on("incoming-voice-call", handleIncomingVoiceCall);
    socket.on("incoming-video-call", handleIncomingVideoCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("incoming-voice-call", handleIncomingVoiceCall);
      socket.off("incoming-video-call", handleIncomingVideoCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
      socket.off("call-ended", handleCallEnded);
    };
  }, [socket, currentUser, incomingCall]);

  // Original socket listeners for messages
  useEffect(() => {
    if (!socket || !currentUser || !conversation) return;

    const handleSentMessage = (msg: SocketMessage) => {
      if (msg.receiverId !== conversation.id) return;

      setMessages((prev) => {
        if (msg.tempId) {
          const tempIndex = prev.findIndex((m) => m.id === msg.tempId);
          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = mapSocketToMessage(msg, currentUser, conversation);
            return updated;
          }
        }

        const existingIndex = prev.findIndex((m) => m.id === msg._id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = mapSocketToMessage(msg, currentUser, conversation);
          return updated;
        }

        const lastMsg = prev[prev.length - 1];
        const timeDiff = lastMsg
          ? new Date(msg.createdAt || msg.timestamp).getTime() - new Date(lastMsg.timestamp).getTime()
          : Infinity;

        if (
          lastMsg &&
          lastMsg.senderId === msg.senderId &&
          lastMsg.text === msg.messageText &&
          Math.abs(timeDiff) < 0.00001
        ) {
          const updated = [...prev];
          updated[prev.length - 1] = mapSocketToMessage(msg, currentUser, conversation);
          return updated;
        }

        return [...prev, mapSocketToMessage(msg, currentUser, conversation)];
      });
    };

    const handleIncomingMessage = (msg: SocketMessage) => {
      if (msg.senderId === currentUser._id) {
        return;
      }

      const isRelevant = msg.senderId === conversation.id && msg.receiverId === currentUser._id;
      if (!isRelevant) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg._id)) {
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

  // Ringtone functions
  const playRingtone = () => {
    try {
      const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-phone-ring-2935.mp3");
      audio.loop = true;
      audio.play().catch(e => console.log("Autoplay prevented:", e));
      return audio;
    } catch (error) {
      console.log("Ringtone error:", error);
    }
  };

  const stopRingtone = () => {
    const audioElements = document.getElementsByTagName('audio');
    for (let audio of audioElements) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  // Call Functions
  const startVoiceCall = () => {
    if (!currentUser || !conversation.id || blockStatus.blockedMe || blockStatus.iBlocked) return;
    
    const callId = `call-${Date.now()}-${currentUser._id}`;
    
    socket.emit("start-voice-call", {
      from: currentUser._id,
      to: conversation.id,
      callId,
      callerName: `${currentUser.firstName} ${currentUser.lastName}`
    });

    setIsCalling(true);
    setCallStatus('calling');
  };

  const startVideoCall = () => {
    if (!currentUser || !conversation.id || blockStatus.blockedMe || blockStatus.iBlocked) return;
    
    const callId = `videocall-${Date.now()}-${currentUser._id}`;
    
    socket.emit("start-video-call", {
      from: currentUser._id,
      to: conversation.id,
      callId,
      callerName: `${currentUser.firstName} ${currentUser.lastName}`
    });

    setIsVideoCalling(true);
    setCallStatus('calling');
  };

  const acceptCall = () => {
    if (!incomingCall || !currentUser) return;
    
    socket.emit("accept-call", {
      from: currentUser._id,
      to: incomingCall.from,
      callId: incomingCall.callId,
      type: incomingCall.type
    });

    setCallStatus('connected');
    stopRingtone();
    
    if (incomingCall.type === 'video') {
      setIsVideoCalling(true);
    } else {
      setIsCalling(true);
    }
  };

  const rejectCall = () => {
    if (!incomingCall || !currentUser) return;
    
    socket.emit("reject-call", {
      from: currentUser._id,
      to: incomingCall.from,
      callId: incomingCall.callId
    });

    setCallStatus('ended');
    setIncomingCall(null);
    stopRingtone();
  };

  const endCall = () => {
    const otherUserId = isCalling || isVideoCalling ? conversation.id : incomingCall?.from;
    const callType = isVideoCalling ? 'video' : 'voice';
    
    socket.emit("end-call", {
      from: currentUser?._id,
      to: otherUserId,
      callId: incomingCall?.callId || `call-${Date.now()}`,
      type: callType
    });

    setCallStatus('ended');
    setIncomingCall(null);
    setIsCalling(false);
    setIsVideoCalling(false);
    stopRingtone();
  };

  // Rest of your existing useEffect hooks
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
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message?currentUserId=${conversation.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
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
  }, [conversation.id, currentUser]);

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

    // ✅ Optimistic UI (ONE TIME ONLY)
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
      },
    ]);

    scrollToBottom();

    try {
      // ==============================
      // 📌 FILE MESSAGE
      // ==============================
      if (files && files.length > 0) {
        const formData = new FormData();
        formData.append("receiverId", conversation.id);

        if (replyingMessage?.id) {
          formData.append("replyToId", replyingMessage.id);
        }

        files.forEach((file) => {
          formData.append("file", file);
        });

        // ✅ SOCKET ONLY FOR FILE
        socket.emit("send-msg", {
          tempId,
          from: currentUser._id,
          to: conversation.id,
          messageText: text,
          replyToId: replyingMessage?.id || null,
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

        if (data.success) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? mapSocketToMessage(data.data, currentUser, conversation)
                : m
            )
          );
        }
        return;
      }

      // ==============================
      // 📌 TEXT MESSAGE (API ONLY)
      // ==============================
      const res = await fetch(
        "https://matrimonial-backend-7ahc.onrender.com/api/message",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverId: conversation.id,
            messageText: text,
            replyToId: replyingMessage?.id || null,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? mapSocketToMessage(data.data, currentUser, conversation)
              : m
          )
        );
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
      setBlockStatus({ ...blockStatus, iBlocked: true });
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
      setBlockStatus({ ...blockStatus, iBlocked: false });
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

      const data = await res.json();
      console.log("Report API Response:", data);

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
    } catch (err) {
      console.error("Report submission error:", err);
      alert("An error occurred while submitting the report");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header with Call Buttons */}
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

        <div className="flex items-center space-x-2">
          {/* Voice Call Button */}
          <button
            onClick={startVoiceCall}
            disabled={blockStatus.blockedMe || blockStatus.iBlocked || !conversationOnline}
            className={`p-2 rounded-full ${blockStatus.blockedMe || blockStatus.iBlocked || !conversationOnline
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            title="Voice Call"
          >
            <Phone size={20} />
          </button>

          {/* Video Call Button */}
          <button
            onClick={startVideoCall}
            disabled={blockStatus.blockedMe || blockStatus.iBlocked || !conversationOnline}
            className={`p-2 rounded-full ${blockStatus.blockedMe || blockStatus.iBlocked || !conversationOnline
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            title="Video Call"
          >
            <Video size={20} />
          </button>

          {/* More Options Button */}
          <div className="relative">
            <button
              onClick={() => setHeaderMenuOpen((prev) => !prev)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MoreVertical size={20} />
            </button>

            {headerMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border z-50 overflow-hidden">
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
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && callStatus === 'ringing' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6 text-center">
            <div className="mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Incoming {incomingCall.type === 'video' ? 'Video' : 'Voice'} Call</h3>
              <p className="text-gray-600 mt-1">{incomingCall.callerName} is calling...</p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={rejectCall}
                className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center"
              >
                <PhoneOff size={18} className="mr-2" />
                Decline
              </button>
              <button
                onClick={acceptCall}
                className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 flex items-center"
              >
                <Phone size={18} className="mr-2" />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Modal */}
      {(isCalling || isVideoCalling || callStatus === 'connected') && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6 text-center">
            <div className="mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                {isVideoCalling ? (
                  <Video size={32} className="text-blue-600" />
                ) : (
                  <Phone size={32} className="text-blue-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold">
                {isVideoCalling ? 'Video Call' : 'Voice Call'} {callStatus === 'calling' ? 'Calling...' : 'Connected'}
              </h3>
              <p className="text-gray-600 mt-1">With {conversation.name}</p>
              <p className="text-sm text-gray-500 mt-2">
                {callStatus === 'calling' ? 'Waiting for answer...' : 'Call in progress'}
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={endCall}
                className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center"
              >
                <PhoneOff size={18} className="mr-2" />
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

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

                  <p className="text-xs mt-1 text-gray-300">{formatTime(msg.timestamp)}</p>

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
        disabled={blockStatus.blockedMe || blockStatus.iBlocked || isCalling || isVideoCalling}
        socket={socket}
        currentUser={currentUser}
        to={conversation.id}
      />

      {/* REPORT POPUP MODAL */}
      {isReportOpen && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl relative">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Report User
              </h3>
              <button
                onClick={() => setIsReportOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
                disabled={isSubmittingReport}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {reportSuccess ? (
                <div className="bg-green-50 text-green-700 p-4 rounded text-center">
                  <div className="text-lg font-semibold mb-2">✓ Report Submitted Successfully!</div>
                  <p>Your report has been received and will be reviewed by our team.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Report *
                    </label>
                    <select
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Please provide detailed information about the issue..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={isSubmittingReport}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attach Proof Images (Optional)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setReportImages(Array.from(e.target.files || []))}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={isSubmittingReport}
                    />

                    {reportImages.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {reportImages.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded overflow-hidden border group">
                            <img
                              src={URL.createObjectURL(img)}
                              className="w-full h-full object-cover"
                              alt={`proof-${i}`}
                            />
                            <button
                              onClick={() => setReportImages(reportImages.filter((_, idx) => idx !== i))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                              disabled={isSubmittingReport}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setIsReportOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
                disabled={isSubmittingReport}
              >
                Cancel
              </button>
              {!reportSuccess && (
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmittingReport || !reportTitle.trim() || !reportDescription.trim()}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded transition disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}