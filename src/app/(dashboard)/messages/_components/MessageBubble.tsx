"use client";

import { Message } from "@/types/chat";
import { Eye, Download, FileText } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.sender === "me";

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImage = (fileType: string) => fileType.startsWith("image/");

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
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isMe ? "flex-row-reverse" : "flex-row"} items-end space-x-2`}>
        {/* Avatar */}
        {!isMe && (
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm">
            {message.avatar ? (
              <img src={message.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              "U"
            )}
          </div>
        )}

        {/* Message content */}
        <div className={`px-4 py-2 rounded-2xl ${isMe ? "bg-indigo-500 text-white rounded-br-md" : "bg-white text-gray-900 shadow-sm border rounded-bl-md"}`}>
          {message.text && <p className="text-sm mb-1">{message.text}</p>}

          {/* Files */}
          {message.files && message.files.length > 0 && (
            <div className="space-y-2 mt-2">
              {message.files.map((file, index) => (
                <div key={index} className="border rounded-lg overflow-hidden relative">
                  {isImage(file.fileType) ? (
                    <div className="relative">
                      <img
                        src={file.fileUrl}
                        alt={file.fileName}
                        className="w-full h-auto max-h-40 object-cover cursor-pointer"
                        onClick={() => window.open(file.fileUrl, "_blank")}
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={() => window.open(file.fileUrl, "_blank")}
                          className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDownload(file.fileUrl, file.fileName)}
                          className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-3 p-3 ${isMe ? "bg-indigo-600" : "bg-gray-50"}`}>
                      <FileText size={20} className={isMe ? "text-white" : "text-gray-600"} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isMe ? "text-white" : "text-gray-900"}`}>
                          {file.fileName}
                        </p>
                        <p className={`text-xs ${isMe ? "text-white/80" : "text-gray-500"}`}>
                          {formatFileSize(file.fileSize)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => window.open(file.fileUrl, "_blank")}
                          className={`p-1 rounded hover:bg-opacity-20 transition-colors ${isMe ? "text-white hover:bg-white/20" : "text-gray-600 hover:bg-gray-200"}`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDownload(file.fileUrl, file.fileName)}
                          className={`p-1 rounded hover:bg-opacity-20 transition-colors ${isMe ? "text-white hover:bg-white/20" : "text-gray-600 hover:bg-gray-200"}`}
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

          <p className={`text-xs mt-1 ${isMe ? "text-white/80" : "text-gray-500"}`}>{formatTime(message.timestamp)}</p>
        </div>

        {/* Avatar for me */}
        {isMe && (
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm">
            {message.avatar ? (
              <img src={message.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              "M"
            )}
          </div>
        )}
      </div>
    </div>
  );
}
