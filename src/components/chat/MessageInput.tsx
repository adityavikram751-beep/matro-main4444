"use client";

import { useState } from "react";
import { Send, Paperclip, MoreHorizontal } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean; // when user is blocked or connection not accepted
}

export default function MessageInput({
  onSendMessage,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (disabled) return; // block sending
    if (!message.trim()) return;

    onSendMessage(message.trim());
    setMessage("");
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">

        {/* More options button */}
        <button
          type="button"
          disabled={disabled}
          className="
            p-2 hover:bg-gray-100 rounded-lg transition-colors 
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <MoreHorizontal size={20} className="text-gray-600" />
        </button>

        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            disabled={disabled}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              disabled
                ? "You can't send messages to this user"
                : "Type a message..."
            }
            className="
              w-full px-4 py-2 pr-18 bg-gray-100 border border-gray-200 
              rounded-full focus:outline-none focus:ring-2 
              focus:ring-purple-500 focus:border-transparent
              disabled:bg-gray-200 disabled:text-gray-500
              disabled:cursor-not-allowed
            "
          />

          {/* Attach file button */}
          <button
            type="button"
            disabled={disabled}
            className="
              absolute right-2 top-1/2 -translate-y-1/2 p-2 
              hover:bg-gray-200 rounded-full transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Paperclip size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="
            p-2 bg-purple-500 text-white rounded-full 
            hover:bg-purple-600 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <Send size={20} />
        </button>

      </form>
    </div>
  );
}
