"use client";

import { Message } from "@/types/chat";
import { Eye, Download, FileText } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  onReply?: (msg: Message) => void;
  onDelete?: (id: string) => void;
}

export default function MessageBubble({ message, onReply, onDelete }: MessageBubbleProps) {
  const isMe = message.sender === "me";

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + " KB";
    return (kb / 1024).toFixed(1) + " MB";
  };

  const isImage = (fileType: string) =>
    fileType?.startsWith("image/") ||
    fileType?.includes("png") ||
    fileType?.includes("jpg") ||
    fileType?.includes("jpeg");

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-end gap-2 max-w-[85%]`}>
        {/* LEFT AVATAR */}
        {!isMe && (
          <img
            src={message.avatar || "/default-avatar.png"}
            className="w-8 h-8 rounded-full object-cover"
            alt="avatar"
          />
        )}

        {/* MESSAGE BOX */}
        <div
          className={`p-3 rounded-2xl relative ${
            isMe
              ? "bg-indigo-600 text-white rounded-br-md"
              : "bg-white text-gray-900 border shadow-sm rounded-bl-md"
          }`}
        >
          {/* ---------- Reply Header ---------- */}
          {message.replyTo && (
            <div className="bg-indigo-100 border-l-4 border-indigo-600 px-2 py-1 text-xs text-indigo-800 rounded mb-2 max-w-[200px] truncate">
              {message.replyTo.text || "Media"}
            </div>
          )}

          {/* ---------- TEXT ---------- */}
          {message.text && <p className="text-sm mb-1">{message.text}</p>}

          {/* ---------- FILES ---------- */}
          {message.files && message.files.length > 0 && (
            <div className="space-y-2 mt-2">
              {message.files.map((file, i) => (
                <div key={i} className="rounded-lg overflow-hidden border relative">
                  {/* IMAGE FILE */}
                  {isImage(file.fileType) ? (
                    <div className="relative">
                      <img
                        src={file.fileUrl}
                        className="w-full max-h-56 object-cover cursor-pointer"
                        onClick={() => window.open(file.fileUrl, "_blank")}
                      />

                      {/* Buttons on image */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={() => window.open(file.fileUrl, "_blank")}
                          className="p-1 bg-black/50 text-white rounded hover:bg-black/70"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDownload(file.fileUrl, file.fileName)}
                          className="p-1 bg-black/50 text-white rounded hover:bg-black/70"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* OTHER FILE TYPES */
                    <div
                      className={`flex items-center gap-3 p-3 ${
                        isMe ? "bg-indigo-700 text-white" : "bg-gray-100"
                      }`}
                    >
                      <FileText size={22} className={isMe ? "text-white" : "text-gray-600"} />

                      <div className="flex-1 min-w-0">
                        <p className={`truncate text-sm font-semibold`}>
                          {file.fileName}
                        </p>
                        <p className="text-xs opacity-80">{formatFileSize(file.fileSize)}</p>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => window.open(file.fileUrl, "_blank")}
                          className={`p-1 rounded ${
                            isMe ? "hover:bg-white/20" : "hover:bg-gray-300"
                          }`}
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleDownload(file.fileUrl, file.fileName)}
                          className={`p-1 rounded ${
                            isMe ? "hover:bg-white/20" : "hover:bg-gray-300"
                          }`}
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ---------- TIME ---------- */}
          <p
            className={`text-xs mt-1 ${
              isMe ? "text-white/80" : "text-gray-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </p>

          {/* ---------- FAILED BADGE ---------- */}
          {message.failedToSend && (
            <p className="text-xs mt-1 text-red-400 font-semibold">
              Message not sent
            </p>
          )}
        </div>

        {/* MY AVATAR */}
        {isMe && (
          <img
            src={message.avatar || "/default-avatar.png"}
            className="w-8 h-8 rounded-full object-cover"
            alt="avatar"
          />
        )}
      </div>
    </div>
  );
}
