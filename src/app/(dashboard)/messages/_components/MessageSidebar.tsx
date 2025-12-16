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

  useEffect(() => {
    if (!socket) return;

    socket.on("user-online", (userId: string) => {
      setOnlineUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    });

    socket.on("user-offline", (userId: string) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, [socket]);

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
    <aside
      className="
        h-full w-full
        bg-white border-r border-gray-200
        flex flex-col
        fixed md:relative md:flex
        z-50
      "
    >
      {/* ---------------- HEADER (Desktop + Mobile) ---------------- */}
     <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
  <div className="flex items-center gap-3">
    <div className="relative">
      {currentUser?.profileImage ? (
        <Image
          src={currentUser.profileImage}
          alt={currentUser?.firstName || "User"}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
          {currentUser?.firstName?.charAt(0) || "U"}
        </div>
      )}
    </div>

    <div>
      <h2 className="font-semibold text-gray-900">
        {currentUser?.firstName} {currentUser?.lastName}
      </h2>
    </div>
  </div>

  <button
    onClick={onCloseSidebar}
    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
  >
    <X className="w-5 h-5 text-gray-600" />
  </button>
</div>


      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              text-sm md:text-base
            "
          />
        </div>
      </div>

      {/* ---------------- CONTACTS HEADER ---------------- */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Contacts</span>
          </div>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {filteredConversations.length}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {onlineUsers.length} users online
        </p>
      </div>

      {/* ---------------- USER LIST ---------------- */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <User className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No users loaded</p>
            <p className="text-sm text-gray-500 mt-1">Try reloading the users</p>
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Reload Users
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Search className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No users found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try searching with a different name
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const isOnline = onlineUsers.includes(conversation.id);

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl cursor-pointer
                    transition-all duration-200 ease-in-out
                    hover:bg-gray-50 active:scale-[0.98]
                    ${
                      selectedConversation?.id === conversation.id
                        ? "bg-indigo-50 border border-indigo-100 shadow-sm"
                        : ""
                    }
                  `}
                >
                  {/* AVATAR WITH ONLINE STATUS */}
                  <div className="relative flex-shrink-0">
                    {conversation.avatar ? (
                      <div className="relative w-12 h-12">
                        <Image
                          src={conversation.avatar}
                          alt={conversation.name}
                          fill
                          sizes="48px"
                          className="rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {conversation.name.charAt(0)}
                      </div>
                    )}
                    
                    {/* Online status indicator */}
                    <div className={`
                      absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white
                      flex items-center justify-center
                      ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
                    `}>
                      {isOnline && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>

                  {/* NAME & LAST MESSAGE */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">
                        {conversation.name}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-xs font-medium rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {conversation.lastMessage || "Say Hello 👋"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">
              {onlineUsers.length} users online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}