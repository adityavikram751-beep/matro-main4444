"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import MessageSidebar from "@/app/(dashboard)/messages/_components/MessageSidebar";
import ChatArea from "@/app/(dashboard)/messages/_components/ChatArea";
import { Conversation } from "@/types/chat";
import { MessageCircle } from "lucide-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

let socket: Socket;

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [messagesMap, setMessagesMap] = useState<
    Record<string, { sender: string; text: string }[]>
  >({});

  /* -------------------------------------------
     FETCH TOKEN
  -------------------------------------------- */
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      decodeUserAndInitSocket(storedToken);
    } else {
      setError("No authentication token found. Please login first.");
      setIsLoading(false);
    }
  }, []);

  /* -------------------------------------------
     DECODE TOKEN + INIT SOCKET
  -------------------------------------------- */
  const decodeUserAndInitSocket = async (authToken: string) => {
    try {
      const tokenData = JSON.parse(atob(authToken.split(".")[1]));
      if (!tokenData.userId) throw new Error("Invalid token format");

      const user: User = {
        _id: tokenData.userId,
        firstName: "Current",
        lastName: "User",
      };
      setCurrentUser(user);

      socket = io("https://matrimonial-backend-7ahc.onrender.com", {
        transports: ["websocket"],
      });
      socket.emit("add-user", user._id);

      await fetchAllUsers(authToken, user);
    } catch (err) {
      console.error(err);
      setError("Failed to initialize application. Invalid token.");
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------
     FETCH USERS
  -------------------------------------------- */
  const fetchAllUsers = async (authToken: string, user: User) => {
    try {
      const res = await fetch(
        "https://matrimonial-backend-7ahc.onrender.com/api/message/AllUser",
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const mapped: Conversation[] = data.data
          .filter((u: User) => u._id !== user._id)
          .map((u: User) => ({
            id: u._id,
            name: `${u.firstName} ${u.lastName}`.trim(),
            avatar: u.profileImage || "/default-avatar.png",
            lastMessage: "",
            isOnline: true,
            unreadCount: 0,
          }));

        setConversations(mapped);

        const fullUser = data.data.find((u: User) => u._id === user._id);
        if (fullUser) setCurrentUser(fullUser);
      } else {
        setError("Invalid users data received");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while fetching users");
    }
  };

  /* -------------------------------------------
     HANDLERS
  -------------------------------------------- */
  const handleRetry = () => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      setIsLoading(true);
      setError(null);
      decodeUserAndInitSocket(storedToken);
    } else setError("No authentication token found. Please login first.");
  };

  const openAcceptedChat = (user: User) => {
    if (!currentUser) return;

    const conv: Conversation = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      avatar: user.profileImage || "/default-avatar.png",
      lastMessage: "",
      isOnline: true,
      unreadCount: 0,
    };

    setSelectedConversation(conv);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    socket?.disconnect();
    localStorage.removeItem("authToken");
    window.location.reload();
  };

  const handleLogin = () => {
    const testToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhjNWVmYTRlYzBjMGFiNmZjZWZkYmIiLCJpYXQiOjE3NTU1OTg1OTksImV4cCI6MTc1NjIwMzM5OX0.ZrYRu0COS1iD_1xNHx0k_lUsruT5iA9YJEANOsTR0YQ";

    localStorage.setItem("authToken", testToken);
    decodeUserAndInitSocket(testToken);
  };

  const handleMessageSent = (conversationId: string, text: string) => {
    if (!currentUser) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: text, unreadCount: 0 }
          : c
      )
    );

    setMessagesMap((prev) => ({
      ...prev,
      [conversationId]: [
        ...(prev[conversationId] || []),
        { sender: currentUser._id, text },
      ],
    }));
  };

  /* -------------------------------------------
     LOADING / ERROR SCREENS
  -------------------------------------------- */
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat application...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">{error}</h1>

          <div className="space-y-2">
            {!token && (
              <button
                onClick={handleLogin}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Login with Test Token
              </button>
            )}

            <button
              onClick={handleRetry}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );

  /* -------------------------------------------
     MAIN RESPONSIVE LAYOUT
  -------------------------------------------- */

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed md:static top-0 left-0 z-30 h-full w-72 md:w-80 bg-white border-r shadow-lg 
          transform transition-transform duration-300 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <MessageSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          currentUser={currentUser}
          socket={socket}
          onSelectConversation={(conv) => setSelectedConversation(conv)}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
          onRetry={handleRetry}
        />
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 bg-gray-50 overflow-hidden">
        {selectedConversation ? (
          <ChatArea
            conversation={selectedConversation}
            currentUser={currentUser}
            socket={socket}
            messages={messagesMap[selectedConversation.id] || []}
            setMessages={(msgs) =>
              setMessagesMap((prev) => ({
                ...prev,
                [selectedConversation.id]: msgs,
              }))
            }
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600">
                Welcome to Chat App
              </h2>
              <p className="text-gray-500">Select a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
