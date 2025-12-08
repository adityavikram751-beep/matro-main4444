"use client";

import { useState } from 'react';
import { Send, Paperclip, MoreHorizontal } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean; // <-- ADD THIS
}

export default function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return; // prevent sending when blocked

    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        
        <button
          type="button"
          disabled={disabled}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <MoreHorizontal size={20} className="text-gray-600" />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            disabled={disabled}  // <-- APPLY DISABLED
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              disabled ? "You can't send messages to this user" : "Type a message..."
            }
            className="
              w-full px-4 py-2 pr-12 bg-gray-100 border border-gray-200 
              rounded-full focus:outline-none focus:ring-2 
              focus:ring-purple-500 focus:border-transparent
              disabled:bg-gray-200 disabled:cursor-not-allowed
            "
          />

          <button
            type="button"
            disabled={disabled}
            className="
              absolute right-2 top-1/2 transform -translate-y-1/2 
              p-1 hover:bg-gray-200 rounded-full transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Paperclip size={16} className="text-gray-600" />
          </button>
        </div>

        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="
            p-2 bg-purple-500 text-white rounded-full 
            hover:bg-purple-600 
            disabled:opacity-50 disabled:cursor-not-allowed 
            transition-colors
          "
        >
          <Send size={20} />
        </button>

      </form>
    </div>
  );
}
