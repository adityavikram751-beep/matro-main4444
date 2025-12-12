"use client";

import { useState } from "react";
import Image from "next/image";

// ---------------- MOCK USERS ----------------
const mockUsers = [
  {
    id: "1",
    name: "Ananya Sharma",
    userId: "CU6789H",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    lastMessage: "Hey! I like your profile 😊",
  },
  {
    id: "2",
    name: "Dimple Sharma",
    userId: "CU6789F",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    lastMessage: "Let's connect! 💬",
  },
  {
    id: "3",
    name: "Akansha Sharma",
    userId: "CU6789G",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    lastMessage: "Nice to meet you 🌸",
  },
  {
    id: "4",
    name: "Shanvi Sharma",
    userId: "CU6789X",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    lastMessage: "Hello! 👋",
  },
];

// ---------------- MOCK CHAT MESSAGES ----------------
const mockMessages = [
  {
    senderId: "1",
    text: "Hey! I like your profile 😊",
    time: "10:30 AM",
  },
  {
    senderId: "user",
    text: "Thank you! I liked yours too. What do you do?",
    time: "10:32 AM",
  },
  {
    senderId: "1",
    text: "I work as a software engineer. How about you?",
    time: "10:33 AM",
  },
  {
    senderId: "user",
    text: "I’m a designer!",
    time: "10:35 AM",
  },
];

// ===================== SIDEBAR COMPONENT =====================
function ChatSidebar({ users, onSelectUser, selectedUser }) {
  return (
    <div className="w-[28%] bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-[#7A0A0A]">Messages</h2>

      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onSelectUser(user)}
          className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition 
            ${selectedUser.id === user.id ? "bg-[#FFF1F1]" : "hover:bg-gray-100"}`}
        >
          <Image
            src={user.avatar}
            alt={user.name}
            width={50}
            height={50}
            className="rounded-full"
          />
          <div>
            <h3 className="font-medium text-[#1E1E1E]">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===================== CHAT WINDOW COMPONENT =====================
function ChatWindow({ user, messages }) {
  return (
    <div className="flex-1 flex flex-col bg-[#F8F8F8]">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 bg-white shadow">
        <Image
          src={user.avatar}
          alt={user.name}
          width={45}
          height={45}
          className="rounded-full"
        />
        <div>
          <h2 className="font-semibold text-[#1E1E1E]">{user.name}</h2>
          <p className="text-xs text-gray-500">{user.userId}</p>
        </div>
      </div>

      {/* MESSAGE LIST */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, index) => {
          const isSelf = msg.senderId === "user";

          return (
            <div
              key={index}
              className={`max-w-[60%] p-3 rounded-2xl text-sm 
                ${isSelf ? "ml-auto bg-[#FFD8D8] text-[#3A0A0A]" : "bg-white text-[#1E1E1E]"}`}
            >
              {msg.text}
              <div className="text-[10px] text-gray-500 mt-1">{msg.time}</div>
            </div>
          );
        })}
      </div>

      {/* INPUT BAR */}
      <div className="p-4 bg-white border-t flex gap-3">
        <input
          type="text"
          placeholder="Type a message…"
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-red-400"
        />
        <button className="px-6 py-2 bg-[#7A0A0A] text-white rounded-full font-medium text-sm hover:bg-[#5C0808] transition">
          Send
        </button>
      </div>
    </div>
  );
}

// ===================== MAIN PAGE =====================
export default function MessagesPage() {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar
        users={mockUsers}
        onSelectUser={setSelectedUser}
        selectedUser={selectedUser}
      />

      <ChatWindow user={selectedUser} messages={mockMessages} />
    </div>
  );
}
