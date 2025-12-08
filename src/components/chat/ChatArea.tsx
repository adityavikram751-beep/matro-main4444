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
  isBlocked?: boolean;   // <-- ADD THIS
}

export default function ChatArea({ 
  conversation, 
  messages, 
  onSendMessage, 
  onOpenSidebar,
  isBlocked = false        // <-- DEFAULT VALUE
}: ChatAreaProps) {
  return (
    <div className="flex flex-col h-full bg-white ">
      
      {/* Chat Header */}
      <div className="border p-5 border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onOpenSidebar}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <div className="relative">
              <Image
                src={conversation?.avatar || "/default-avatar.png"}
                alt={conversation?.name || "User"}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              {conversation.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div>
              <h2 className="font-semibold text-gray-900">{conversation?.name || "User"}</h2>
              <p className="text-sm text-gray-500">#CU6798H</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} disabled={isBlocked} />
    </div>
  );
}
