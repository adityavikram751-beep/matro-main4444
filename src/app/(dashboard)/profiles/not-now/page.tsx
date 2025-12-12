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
    } catch {
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
        body: JSON.stringify({ userIdToUnblock: userId }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("User restored");
        setBlockedProfiles((prev) => prev.filter((p) => p._id !== userId));
      } else {
        toast.error("Failed to restore user");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  /* ---------------- LOADING UI ---------------- */
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-rose-50 to-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-t-2 border-rose-500 border-b-2"></div>
        <p className="text-gray-700 font-medium mt-4 text-base sm:text-lg text-center">
          Fetching Not-Now Profiles...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

      {/* Page Title */}
      <h1
        className="
          text-3xl sm:text-4xl 
          font-extrabold 
          mb-10 sm:mb-12 
          text-center 
          bg-gradient-to-r from-gray-900 to-gray-600 
          bg-clip-text 
          text-transparent 
          drop-shadow-sm
        "
      >
        Not-Now Profiles
      </h1>

      {/* EMPTY STATE */}
      {blockedProfiles.length === 0 ? (
        <div className="flex flex-col items-center gap-4 mt-20">
          <Image
            src="/empty-state.png"
            width={160}
            height={160}
            alt="empty"
            className="opacity-70 w-32 h-32 sm:w-40 sm:h-40"
          />
          <p className="text-gray-500 text-base sm:text-lg text-center">
            No users added to Not-Now list.
          </p>
        </div>
      ) : (
        <div
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            gap-6 sm:gap-8
          "
        >
          {blockedProfiles.map((profile) => (
            <div
              key={profile._id}
              className="
                relative 
                backdrop-blur-xl 
                bg-white/50 
                shadow-lg 
                hover:shadow-2xl 
                hover:-translate-y-1 
                transition-all 
                duration-300 
                rounded-3xl 
                p-5 sm:p-6 
                flex flex-col 
                items-center 
                text-center 
                border 
                border-white/20 
                group
              "
            >
              {/* Profile Image */}
              <div
                className="
                  w-24 h-24 sm:w-28 sm:h-28 
                  rounded-full 
                  overflow-hidden 
                  shadow-lg 
                  ring-4 
                  ring-rose-300 
                  mb-4 
                  group-hover:scale-105 
                  transition-all
                "
              >
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

              {/* Name + Age */}
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {profile.name}
              </h2>

              {profile.age && (
                <p className="text-gray-500 text-sm mt-1">{profile.age} years old</p>
              )}

              {/* Restore Button */}
              <button
                onClick={() => handleUnblock(profile._id)}
                className="
                  mt-5 
                  w-full 
                  py-2.5 
                  bg-gradient-to-r from-rose-600 to-red-500 
                  text-white 
                  font-semibold 
                  rounded-full 
                  hover:opacity-90 
                  transition-all 
                  relative 
                  overflow-hidden
                  text-sm sm:text-base
                "
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
