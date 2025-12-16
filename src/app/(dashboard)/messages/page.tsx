"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import MessageSidebar from "@/app/(dashboard)/messages/_components/MessageSidebar";
import ChatArea from "@/app/(dashboard)/messages/_components/ChatArea";
import { Conversation } from "@/types/chat";
import { MessageCircle, Menu } from "lucide-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

let socket: Socket;

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  // 👉 MOBILE ONLY SIDEBAR CONTROL
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [messagesMap, setMessagesMap] = useState<
    Record<string, { sender: string; text: string }[]>
  >({});

  /* -------------------------------------------
     FETCH TOKEN
  -------------------------------------------- */
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      decodeUserAndInitSocket(storedToken);
    } else {
      setError("No authentication token found. Please login first.");
      setIsLoading(false);
    }
  }, []);

  const decodeUserAndInitSocket = async (authToken: string) => {
    try {
      const tokenData = JSON.parse(atob(authToken.split(".")[1]));
      if (!tokenData.userId) throw new Error("Invalid token format");

      const user: User = {
        _id: tokenData.userId,
        firstName: "Current",
        lastName: "User",
      };
      setCurrentUser(user);

      socket = io("https://matrimonial-backend-7ahc.onrender.com", {
        transports: ["websocket"],
      });
      socket.emit("add-user", user._id);

      await fetchAllUsers(authToken, user);
    } catch (err) {
      console.error(err);
      setError("Failed to initialize application.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async (authToken: string, user: User) => {
    try {
      const res = await fetch(
        "https://matrimonial-backend-7ahc.onrender.com/api/message/AllUser",
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const data = await res.json();

      const mapped: Conversation[] = data.data
        .filter((u: User) => u._id !== user._id)
        .map((u: User) => ({
          id: u._id,
          name: `${u.firstName} ${u.lastName}`.trim(),
          avatar: u.profileImage || "/default-avatar.png",
          lastMessage: "",
          isOnline: true,
          unreadCount: 0,
        }));

      setConversations(mapped);
    } catch (err) {
      console.error(err);
      setError("Network error while fetching users");
    }
  };

  const handleMessageSent = (conversationId: string, text: string) => {
    if (!currentUser) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: text, unreadCount: 0 }
          : c
      )
    );

    setMessagesMap((prev) => ({
      ...prev,
      [conversationId]: [
        ...(prev[conversationId] || []),
        { sender: currentUser._id, text },
      ],
    }));
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );


  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* 🔥 MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static top-0 left-0 h-full z-40
          w-[280px] md:w-[320px]
          bg-white border-r shadow-lg
          transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <MessageSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          currentUser={currentUser}
          socket={socket}
          onSelectConversation={(conv) => {
            setSelectedConversation(conv);
            setIsSidebarOpen(false); // 👈 MOBILE AUTO CLOSE
          }}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onRetry={() => window.location.reload()}
        />
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 relative overflow-hidden">

        {/* 🔥 MOBILE HEADER */}
        <div className="md:hidden flex items-center gap-3 p-3 border-b bg-white">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-semibold">Messages</h2>
        </div>

        {selectedConversation ? (
          <ChatArea
            conversation={selectedConversation}
            currentUser={currentUser}
            socket={socket}
            messages={messagesMap[selectedConversation.id] || []}
            setMessages={(msgs) =>
              setMessagesMap((prev) => ({
                ...prev,
                [selectedConversation.id]: msgs,
              }))
            }
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600">
                Select a chat to start
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
