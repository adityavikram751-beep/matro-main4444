
'use client';

import { useState } from "react";

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
    userId: "CU6789f",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    lastMessage: "Hey! I like your profile 😊",
},
 { 
     id: "3",
    name: "Akansha Sharma",
    userId: "CU6789g",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    lastMessage: "Hey! I like your profile 😊",
},
 { 
     id: "4",
    name: "shanvi Sharma",
    userId: "CU6789g",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    lastMessage: "Hey! I like your profile 😊",
},

];
const mockMessages = [
    {
        senderId: "1",
        text: "Hey! I like your profile 😊",
        time: "10:30 AM",
    },
    {
        senderId: "2",
        text: "Thank you! I liked yours too. What do you do?",
        time: "10:32 AM",
    },
    {
        senderId: "3",
        text: "I work as a software engineer. How about you?",
        time: "10:33 AM",
    },
    {
        senderId: "4",
        text: "I'm a graphic designer. I love creating art!",
        time: "10:35 AM",
    }
]; 

export default function MessagesPage() {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);

  return (
    <div className="flex h-screen">
      {/* <ChatSidebar users={mockUsers} onSelectUser={setSelectedUser} /> */}
      {/* <ChatWindow user={selectedUser} messages={mockMessages} /> */}
    </div>
  );
}
