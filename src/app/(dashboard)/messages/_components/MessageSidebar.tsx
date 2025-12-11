"use client";

import { useState, useEffect } from "react";
import { Search, Users, User } from "lucide-react";
import Image from "next/image";
import { Conversation } from "@/types/chat";
import { Socket } from "socket.io-client";

interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

interface MessageSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  currentUser: UserType | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCloseSidebar: () => void;
  onLogout: () => void;
  onRetry: () => void;
  socket: Socket;
}

export default function MessageSidebar({
  conversations,
  selectedConversation,
  currentUser,
  onSelectConversation,
  onCloseSidebar,
  onLogout,
  onRetry,
  socket,
}: MessageSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------
      SOCKET — ONLINE STATUS
  -------------------------------------------------- */
  useEffect(() => {
    if (!socket) return;

    socket.on("user-online", (userId: string) => {
      setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    });

    socket.on("user-offline", (userId: string) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, [socket]);

  /* -------------------------------------------------
      FETCH ONLINE USERS (initial)
  -------------------------------------------------- */
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          "https://matrimonial-backend-7ahc.onrender.com/api/message/online",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        setOnlineUsers(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Error fetching online users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* -------------------------------------------------
      RENDER UI
  -------------------------------------------------- */
  return (
    <div className="w-full md:w-80 bg-white shadow-xl flex flex-col h-full">
      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* USER LIST */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center space-x-2 mb-3 px-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Contacts ({filteredConversations.length})
            </span>
          </div>

          {/* No Conversations */}
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <User className="h-12 w-12 mx-auto opacity-40" />
              <p>No users loaded</p>
              <button
                onClick={onRetry}
                className="mt-2 text-indigo-600 text-sm hover:underline"
              >
                Retry
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <User className="h-12 w-12 mx-auto opacity-40" />
              <p>No users found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const isOnline = onlineUsers.includes(conversation.id);

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedConversation?.id === conversation.id
                      ? "bg-indigo-50 border-l-4 border-indigo-500"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative w-fit">
                    {conversation.avatar ? (
                      <Image
                        src={conversation.avatar}
                        alt={conversation.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white text-lg font-semibold">
                        {conversation.name.charAt(0)}
                      </div>
                    )}

                    {/* ONLINE INDICATOR */}
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  {/* Name + Last Message */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.name}
                    </h3>

                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage || "Say Hello 👋"}
                    </p>
                  </div>

                  {/* Unread count */}
                  {conversation.unreadCount > 0 && (
                    <span className="bg-indigo-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
