"use client";

import { Search, X } from 'lucide-react';
import { Conversation } from '@/types/chat';
import Image from 'next/image';

interface MessageSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation;
  onSelectConversation: (conversation: Conversation) => void;
  onCloseSidebar: () => void;
}

export default function MessageSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  onCloseSidebar
}: MessageSidebarProps) {
  return (
    <div className="w-120 bg-white flex flex-col h-full">
      <div className="px-5 py-5 border">

        {/* Header */}
        <div className="p-5 border border-gray-200 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <button
              onClick={onCloseSidebar}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {conversations.map((conversation, index) => (
              <div
                key={`${conversation.id}-${index}`}
                onClick={() => {
                  onSelectConversation(conversation);
                  onCloseSidebar();
                }}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? "bg-blue-50 border-r-2 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  
                  {/* Avatar */}
                  <div className="relative">
                    <Image
                      src={conversation.avatar ?? "/default-avatar.png"} // ✅ FIXED
                      alt={conversation.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.name}
                      </h3>

                      {/* Unread Badge */}
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
