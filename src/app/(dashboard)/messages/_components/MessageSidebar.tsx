"use client";

import { useState, useEffect } from "react";
import { Search, Users, User, X } from "lucide-react";
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
  onRetry: () => void;
  socket: Socket;
}

export default function MessageSidebar({
  conversations,
  selectedConversation,
  currentUser,
  onSelectConversation,
  onCloseSidebar,
  onRetry,
  socket,
}: MessageSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /* SOCKET ONLINE STATUS */
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

  /* FETCH ONLINE USERS */
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

  return (
    <div
      className="
        fixed md:static top-0 left-0 h-full w-72 md:w-80 bg-white 
        shadow-xl border-r z-40 flex flex-col 
        transform transition-all duration-300
      "
    >
      {/* MOBILE HEADER WITH CLOSE BUTTON */}
      <div className="md:hidden flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>

        <button
          onClick={onCloseSidebar}
          className="p-2 rounded-md hover:bg-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2 border rounded-lg 
              text-sm focus:ring-2 focus:ring-indigo-500
            "
          />
        </div>
      </div>

      {/* USER LIST */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <div className="flex items-center space-x-2 px-2 mb-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Contacts ({filteredConversations.length})
          </span>
        </div>

        {/* Empty List */}
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <User className="w-12 h-12 mx-auto opacity-40" />
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
            <User className="w-12 h-12 mx-auto opacity-40" />
            <p>No users found</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const isOnline = onlineUsers.includes(conversation.id);

            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer 
                  transition hover:bg-gray-100
                  ${
                    selectedConversation?.id === conversation.id
                      ? "bg-indigo-50 border-l-4 border-indigo-500"
                      : ""
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative">
                  {conversation.avatar ? (
                    <Image
                      src={conversation.avatar}
                      alt={conversation.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="
                        w-12 h-12 rounded-full bg-indigo-500 
                        flex items-center justify-center text-white 
                        text-lg font-semibold
                      "
                    >
                      {conversation.name.charAt(0)}
                    </div>
                  )}

                  {/* Online dot */}
                  {isOnline && (
                    <span
                      className="
                        absolute bottom-0 right-0 w-3 h-3 bg-green-500 
                        border-2 border-white rounded-full
                      "
                    ></span>
                  )}
                </div>

                {/* Name + Last Message */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                    {conversation.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {conversation.lastMessage || "Say Hello 👋"}
                  </p>
                </div>

                {/* Unread Count */}
                {conversation.unreadCount > 0 && (
                  <span
                    className="
                      bg-indigo-600 text-white text-xs rounded-full 
                      min-w-[20px] h-5 px-2 flex items-center justify-center
                    "
                  >
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
