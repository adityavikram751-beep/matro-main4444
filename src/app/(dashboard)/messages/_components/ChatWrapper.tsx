"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import MessageSidebar from "./MessageSidebar";
import MessageArea from "./ChatArea";
import { Conversation, Message, MessageFile } from "@/types/chat";
import { MessageCircle } from "lucide-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

interface ChatWrapperProps {
  testToken?: string;
}

let socket: Socket;

/* ---------------------------------------------------
   TEMPORARY LOCAL PREVIEW OF FILES (before upload)
---------------------------------------------------- */
const prepareLocalPreview = (files: File[]): MessageFile[] =>
  files.map((file) => ({
    fileName: file.name,
    fileUrl: URL.createObjectURL(file),
    fileType: file.type,
    fileSize: file.size,
  }));

export default function ChatWrapper({ testToken }: ChatWrapperProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------------------
      LOAD TOKEN & INITIALIZE APP
  ---------------------------------------------------- */
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken") || testToken;

    if (storedToken) {
      setToken(storedToken);
      initializeApp(storedToken);
    } else {
      setError("No authentication token found.");
      setIsLoading(false);
    }
  }, []);

  /* ---------------------------------------------------
      INITIALIZE APP
  ---------------------------------------------------- */
  const initializeApp = async (authToken: string) => {
    try {
      let userId: string | undefined;

      // Decode JWT to get userId
      try {
        const tokenData = JSON.parse(atob(authToken.split(".")[1]));
        userId = tokenData.userId;

        if (userId) setCurrentUser({ _id: userId, firstName: "Current", lastName: "User" });
      } catch {
        setError("Invalid token format");
        return;
      }

      // Initialize socket
      socket = io("https://matrimonial-backend-7ahc.onrender.com", {
        transports: ["websocket"],
      });

      if (userId) socket.emit("add-user", userId);

      // Fetch users list
      await fetchAllUsers(authToken);

      // Setup socket listeners
      setupSocketListeners();
    } catch (err) {
      console.error(err);
      setError("Failed to initialize chat");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------
      FETCH ALL USERS (ACCEPTED CONTACT LIST)
  ---------------------------------------------------- */
  const fetchAllUsers = async (authToken: string) => {
    try {
      const res = await fetch(
        "https://matrimonial-backend-7ahc.onrender.com/api/message/allUser",
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const mapped: Conversation[] = data.data
          .filter((u: User) => u._id !== currentUser?._id)
          .map((user: User) => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            avatar: user.profileImage || "/default-avatar.png",
            lastMessage: "",
            isOnline: false,
            unreadCount: 0,
          }));

        setConversations(mapped);

        const fullUser = data.data.find((u: User) => u._id === currentUser?._id);
        if (fullUser) setCurrentUser(fullUser);
      } else {
        setError("Invalid users data");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    }
  };

  /* ---------------------------------------------------
      SOCKET LISTENERS
  ---------------------------------------------------- */
  const setupSocketListeners = () => {
    if (!socket || !currentUser) return;

    // Full message history
    socket.on("messages-history", (msgs: Message[]) => {
      setMessages(msgs);
      scrollToBottom();
    });

    // When you receive message from other user
    socket.on("msg-receive", (msg: Message) => {
      setMessages((prev) => [...prev, { ...msg, sender: "other" }]);
      scrollToBottom();
    });

    // When backend confirms your sent message
    socket.on("msg-sent", (msg: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.tempId ? { ...msg, sender: "me" } : m))
      );
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------------------------------------------
      🚀 SEND MESSAGE + FILES
  ---------------------------------------------------- */
  const onSendMessage = async (text: string, files?: File[]) => {
    if (!currentUser || !selectedConversation?.id) return;
    if (!text.trim() && (!files || files.length === 0)) return;

    const token = localStorage.getItem("authToken");

    // Temporary local preview for UI
    const localFiles = files?.length ? prepareLocalPreview(files) : [];

    // Create temp ID
    const tempId = "temp-" + Date.now();

    // Optimistic UI message (instant)
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        senderId: currentUser._id,
        receiverId: selectedConversation.id,
        text,
        timestamp: new Date().toISOString(),
        sender: "me",
        avatar: currentUser.profileImage,
        files: localFiles,
      },
    ]);

    scrollToBottom();

    // SOCKET emit instantly
    socket.emit("send-msg", {
      tempId,
      from: currentUser._id,
      to: selectedConversation.id,
      messageText: text,
    });

    // Prepare form data for backend
    const formData = new FormData();
    formData.append("receiverId", selectedConversation.id);
    formData.append("messageText", text);

    if (files) {
      files.forEach((file) => formData.append("files", file));
    }

    // API upload
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
    console.log("📥 Backend saved message:", data);
  };

  /* ---------------------------------------------------
      ACTION HANDLERS
  ---------------------------------------------------- */
  const handleRetry = () => {
    if (token) initializeApp(token);
  };

  const handleLogout = () => {
    socket?.disconnect();
    localStorage.removeItem("authToken");
    window.location.reload();
  };

  /* ---------------------------------------------------
      RENDER UI
  ---------------------------------------------------- */
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={handleRetry} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <div
        className={`fixed md:static z-20 w-80 h-full bg-white border-r transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300`}
      >
        <MessageSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          currentUser={currentUser}
          onSelectConversation={(conv) => {
            setSelectedConversation(conv);
            setIsSidebarOpen(false);
          }}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
          socket={socket}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-50 relative">
        {selectedConversation ? (
          <MessageArea
            conversation={selectedConversation}
            currentUser={currentUser}
            messages={messages}
            onSendMessage={onSendMessage}
            messagesEndRef={messagesEndRef}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
