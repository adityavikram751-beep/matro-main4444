"use client";

import { Phone, Video, Info, Menu } from 'lucide-react';
import { Conversation, Message } from '@/types/chat';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import Image from 'next/image';

interface ChatAreaProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onOpenSidebar: () => void;
  isBlocked?: boolean;
}

export default function ChatArea({
  conversation,
  messages,
  onSendMessage,
  onOpenSidebar,
  isBlocked = false,
}: ChatAreaProps) {
  return (
    <div className="flex flex-col h-full bg-white">

      {/* HEADER */}
      <div className="border-b border-gray-200 bg-white p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center space-x-3">

            {/* Mobile sidebar trigger */}
            <button
              onClick={onOpenSidebar}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu size={22} />
            </button>

            {/* Profile image */}
            <div className="relative">
              <Image
                src={conversation?.avatar || "/default-avatar.png"}
                alt={conversation?.name || "User"}
                width={45}
                height={45}
                className="w-11 h-11 rounded-full object-cover"
              />
              {conversation?.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>

            {/* Name */}
            <div className="flex flex-col">
              <h2 className="font-semibold text-gray-900 text-base sm:text-lg">
                {conversation?.name || "User"}
              </h2>
              <p className="text-xs text-gray-500">#CU6798H</p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center space-x-1 sm:space-x-2">

            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Phone size={20} className="text-gray-600" />
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Video size={20} className="text-gray-600" />
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Info size={20} className="text-gray-600" />
            </button>

          </div>
        </div>
      </div>

      {/* MESSAGES SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* MESSAGE INPUT */}
      <MessageInput
        onSendMessage={onSendMessage}
        disabled={isBlocked}
      />

    </div>
  );
}
