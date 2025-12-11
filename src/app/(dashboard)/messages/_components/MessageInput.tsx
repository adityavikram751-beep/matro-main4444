"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, Image as ImageIcon, FileText } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (text: string, files?: File[]) => void;
  replyingMessage?: { text: string; id: string };
  onCancelReply?: () => void;
  disabled?: boolean;

  socket: any;
  currentUser: { _id: string } | null;
  to: string;
}

export default function MessageInput({
  onSendMessage,
  replyingMessage,
  onCancelReply,
  disabled,
  socket,
  currentUser,
  to,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /* TYPING STATE */
  const typingTimeout = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  /* Auto-resize textarea */
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [message]);

  /* Emit typing event */
  const emitTyping = () => {
    if (!socket || !currentUser) return;

    if (!isTypingRef.current) {
      socket.emit("typing", { from: currentUser._id, to });
      isTypingRef.current = true;
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = window.setTimeout(() => {
      socket.emit("stop-typing", { from: currentUser._id, to });
      isTypingRef.current = false;
    }, 900);
  };

  /* Send message */
  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!message.trim() && selectedFiles.length === 0) return;

    onSendMessage(message.trim(), selectedFiles);

    setMessage("");
    setSelectedFiles([]);

    if (isTypingRef.current && socket && currentUser) {
      socket.emit("stop-typing", { from: currentUser._id, to });
      isTypingRef.current = false;
    }
  };

  /* ENTER-to-send */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  /* File selection */
  const handleFileChange = (e: any) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files as FileList);
    setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  /* Remove one file */
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* Drag + Drop handlers */
  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files?.length) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  /* Cleanup typing on unmount */
  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      if (isTypingRef.current && socket && currentUser) {
        socket.emit("stop-typing", { from: currentUser._id, to });
      }
    };
  }, []);

  return (
    <div
      className={`p-4 border-t bg-white ${isDragging ? "bg-indigo-50 border-indigo-500" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center bg-gray-100 border px-2 py-1 rounded-lg"
            >
              {file.type.startsWith("image/") ? (
                <ImageIcon className="w-4 h-4 mr-1 text-gray-600" />
              ) : (
                <FileText className="w-4 h-4 mr-1 text-gray-600" />
              )}
              <span className="text-xs truncate max-w-[120px]">{file.name}</span>
              <button type="button" onClick={() => removeFile(i)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Replying preview (Instagram-style small bar) */}
      {replyingMessage && (
        <div className="flex items-center justify-between bg-indigo-50 border-l-4 border-indigo-600 px-3 py-2 rounded mb-2">
          <div className="truncate max-w-[75%] text-indigo-700 text-sm">
            Replying to: <span className="font-semibold">{replyingMessage.text}</span>
          </div>
          <button onClick={onCancelReply} className="text-indigo-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Upload button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          disabled={disabled}
          placeholder={disabled ? "You cannot send messages" : "Type your message..."}
          onChange={(e) => {
            setMessage(e.target.value);
            emitTyping();
          }}
          onKeyPress={handleKeyPress}
          rows={1}
          className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     disabled:opacity-50 overflow-hidden"
          style={{ minHeight: "44px", maxHeight: "180px" }}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || (!message.trim() && selectedFiles.length === 0)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg 
                     disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {isDragging && (
        <p className="text-sm text-indigo-600 mt-2">Drop files to upload</p>
      )}
    </div>
  );
}
