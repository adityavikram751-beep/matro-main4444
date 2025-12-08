"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

type Profile = {
  _id: string;
  name: string;
  age?: number;
  profileImage?: string;
};

export default function NotNowPage() {
  const [blockedProfiles, setBlockedProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/cross/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setBlockedProfiles(data.data || []);
      } else {
        toast.error("Failed to load blocked users");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/cross/user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
        body: JSON.stringify({ userIdToUnblock: userId })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("User restored");
        setBlockedProfiles((prev) => prev.filter((p) => p._id !== userId));
      } else {
        toast.error("Failed to restore user");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  // 🌟 Beautiful Loading UI
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-rose-500 border-b-2"></div>
        <p className="text-gray-700 font-medium mt-4 text-lg">
          Fetching Not-Now Profiles...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
<h1 className="text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent drop-shadow-sm">
  Not-Now Profiles
</h1>

      {blockedProfiles.length === 0 ? (
        <div className="flex flex-col items-center gap-4 mt-24">
          <Image
            src="/empty-state.png"
            width={180}
            height={180}
            alt="empty"
            className="opacity-70"
          />
          <p className="text-gray-500 text-lg">No users added to Not-Now list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blockedProfiles.map((profile) => (
            <div
              key={profile._id}
              className="relative backdrop-blur-xl bg-white/40 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-3xl p-6 flex flex-col items-center text-center border border-white/20 group"
            >
              {/* Profile Image */}
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg ring-4 ring-rose-300 mb-4 group-hover:scale-105 transition">
                {profile.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt={profile.name}
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-3xl font-bold">
                    ?
                  </div>
                )}
              </div>

              {/* Name & Age */}
              <h2 className="text-xl font-bold text-gray-800">
                {profile.name}
              </h2>
              {profile.age && (
                <p className="text-gray-500 text-sm mt-1">
                  {profile.age} years old
                </p>
              )}

              {/* Restore Button */}
              <button
                onClick={() => handleUnblock(profile._id)}
                className="mt-5 w-full py-2 bg-gradient-to-r from-rose-600 to-red-500 text-white font-semibold rounded-full hover:opacity-90 transition-all relative overflow-hidden"
              >
                <span className="relative z-10">Restore</span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all bg-white"></span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
