"use client";

import { Message } from "@/types/chat";
import Image from "next/image";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.sender === "me";

  // Runtime safe fallback
  const avatarSrc = message.avatar && message.avatar.length > 5 
    ? message.avatar 
    : "/default-avatar.png";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex max-w-[80%] md:max-w-[70%] lg:max-w-[60%] 
          ${isMe ? "flex-row-reverse" : "flex-row"} 
          items-end gap-2`}
      >

        {/* 🔹 Avatar (Left side only for incoming) */}
        {!isMe && (
          <Image
            src={avatarSrc}
            alt={message.sender || "User"}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}

        {/* 🔹 Message Bubble */}
        <div
          className={`px-4 py-2 rounded-2xl break-words
            ${isMe 
              ? "bg-blue-500 text-white rounded-br-md" 
              : "bg-gray-200 text-gray-900 rounded-bl-md"
            }`}
        >
          <p className="text-sm leading-snug">{message.text}</p>

          <p
            className={`text-xs mt-1 
              ${isMe ? "text-blue-100" : "text-gray-500"}
            `}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* 🔹 Avatar (Right side only for my messages) */}
        {isMe && (
          <Image
            src={avatarSrc}
            alt={message.sender || "Me"}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
