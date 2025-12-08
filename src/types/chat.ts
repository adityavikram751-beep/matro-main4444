// ===============================
// Conversation Interface
// ===============================

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  isOnline: boolean;
  unreadCount?: number;

  messages?: {
    id?: string;
    sender: string;
    text: string;
    timestamp?: string;
    seen?: boolean;        // 👈 Add seen tick
  }[];

  typing?: boolean;        // 👈 Add typing indicator flag
}



// ===============================
// Message File Interface
// ===============================

export interface MessageFile {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}



// ===============================
// Main Message Interface
// ===============================

export interface Message {
  id: string;              // final ID from server
  tempId?: string;         // temp ID for optimistic UI
  senderId: string;
  receiverId: string;
  text?: string;
  sender: "me" | "other";
  avatar?: string;
  files?: MessageFile[];
  replyTo?: Message;
  timestamp: string;

  seen?: boolean;          // 👈 Add seen support
}



// ===============================
// Raw Socket Message from Backend
// ===============================

export interface SocketMessage {
  _id?: string;
  tempId?: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  createdAt?: string;

  files?: MessageFile[];
  replyTo?: SocketMessage;

  seen?: boolean;           // 👈 Backend will send seen status
}
