"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import MessageSidebar from "./MessageSidebar";
import ChatArea from "./ChatArea";
import { Conversation, Message, SocketMessage } from "@/types/chat";
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

export default function ChatWrapper({ testToken }: ChatWrapperProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken") || testToken;

    if (storedToken) {
      setToken(storedToken);
      initializeApp(storedToken);
    } else {
      setError("No authentication token found");
      setIsLoading(false);
    }
  }, []);

  const initializeApp = async (authToken: string) => {
    try {
      let userId: string | undefined;

      try {
        const tokenData = JSON.parse(atob(authToken.split(".")[1]));
        userId = tokenData.userId;

        if (userId) {
          setCurrentUser({
            _id: userId,
            firstName: "Current",
            lastName: "User",
          });
        }
      } catch {
        setError("Invalid token");
        return;
      }

      socket = io("https://matrimonial-backend-7ahc.onrender.com", {
        transports: ["websocket"],
      });

      if (userId) socket.emit("add-user", userId);

      await fetchAllUsers(authToken);
      setupSocketListeners();
    } catch (err) {
      console.error(err);
      setError("Failed to initialize chat");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async (authToken: string) => {
    try {
      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/message/allUser", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data
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
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    }
  };

  const setupSocketListeners = () => {
    if (!socket || !currentUser) return;

    const mapSocketToLocal = (msg: SocketMessage): Message => ({
      id: msg._id || msg.tempId || "msg-" + Date.now(),
      senderId: msg.senderId || msg.from,
      receiverId: msg.receiverId || msg.to,
      text: msg.messageText || "",
      timestamp: msg.createdAt || new Date().toISOString(),
      sender: msg.senderId === currentUser._id ? "me" : "other",
      avatar:
        msg.senderId === currentUser._id
          ? currentUser.profileImage
          : selectedConversation?.avatar,
      files: msg.files || [],
      replyTo: undefined,
    });

    socket.on("msg-receive", (msg: SocketMessage) => {
      if (!selectedConversation) return;
      if (msg.senderId !== selectedConversation.id) return;

    });

    socket.on("msg-sent", (msg: SocketMessage) => {});
    
    socket.on("user-online", (userId: string) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, isOnline: true } : c))
      );
    });

    socket.on("user-offline", (userId: string) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, isOnline: false } : c))
      );
    });
  };


  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-b-2 border-indigo-600 rounded-full" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => token && initializeApp(token)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">

      {/* SIDEBAR RESPONSIVE */}
      <div
        className={`
          fixed top-0 left-0 h-full w-72 bg-white shadow-md z-30 
          transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
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
          onLogout={() => {
            socket.disconnect();
            localStorage.removeItem("authToken");
            window.location.reload();
          }}
          socket={socket}
        />
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 h-full relative bg-gray-100">

        {selectedConversation ? (
          <ChatArea
            conversation={selectedConversation}
            currentUser={currentUser}
            socket={socket}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <MessageCircle className="w-24 h-24 text-gray-300 mx-auto" />
              <p className="text-gray-500">Select a contact to start chatting</p>
            </div>
          </div>
        )}

        {/* MOBILE — OPEN SIDEBAR BUTTON */}
        {!selectedConversation && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg"
          >
            ☰
          </button>
        )}
      </div>
    </div>
  );
}
