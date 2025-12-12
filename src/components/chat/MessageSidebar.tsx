"use client";

import { Search, X } from "lucide-react";
import { Conversation } from "@/types/chat";
import Image from "next/image";

interface MessageSidebarProps {
  conversations: Conversation[];
  selectedConversation?: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCloseSidebar: () => void;
}

export default function MessageSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  onCloseSidebar,
}: MessageSidebarProps) {
  return (
    <div className="w-72 md:w-80 bg-white flex flex-col h-full">
      <div className="px-4 py-4">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>

          {/* Close icon on mobile */}
          <button
            onClick={onCloseSidebar}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search conversations"
          />
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto h-[70vh] pr-2">
          {conversations.map((conversation, index) => {
            const isSelected = selectedConversation?.id === conversation.id;
            const unread = Number(conversation.unreadCount || 0);

            return (
              <button
                key={`${conversation.id ?? "conv"}-${index}`}
                onClick={() => {
                  onSelectConversation(conversation);
                  onCloseSidebar();
                }}
                type="button"
                className={`w-full text-left p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg flex items-start space-x-3 ${
                  isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Image
                    src={conversation.avatar ?? "/default-avatar.png"}
                    alt={conversation.name ?? "Conversation"}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                    priority={false}
                  />
                  {conversation.isOnline && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.name ?? "Unknown"}
                    </h3>

                    {/* Unread Badge */}
                    {unread > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {unread}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 truncate mt-1">
                    {conversation.lastMessage ?? "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Empty state */}
          {conversations.length === 0 && (
            <div className="text-center py-6 text-gray-600">No conversations</div>
          )}
        </div>
      </div>
    </div>
  );
}
