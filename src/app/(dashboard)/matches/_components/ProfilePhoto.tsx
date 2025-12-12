"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Send, Heart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Loading from "../../../../Loading";

export default function ProfilePhoto({ activeTab }: { activeTab: string }) {
  const [profilesWithPhoto, setProfilesWithPhoto] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSendingConnection, setIsSendingConnection] = useState<any>({});
  const [isSendingLike, setIsSendingLike] = useState<any>({});

  const router = useRouter();

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 10;

  const calculateAge = (dob: string) => {
    if (!dob) return "—";
    const d = new Date(dob);
    return new Date().getFullYear() - d.getFullYear();
  };

  // FETCH PROFILES
  useEffect(() => {
    if (activeTab !== "Profile with photo") return;

    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");

        const res = await fetch(
          "https://matrimonial-backend-7ahc.onrender.com/api/profile/with-photo",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();

        const cleaned = (data.photo || []).map((u: any) => ({
          ...u,
          age: calculateAge(u.dateOfBirth),
          caste: u.caste || "—",
          education: u.highestEducation || "—",
          salary: u.annualIncome || "—",
          profession: u.designation || "—",
          location:
            [u.city, u.state, u.country].filter(Boolean).join(", ") || "—",
          languages: u.motherTongue ? [u.motherTongue] : ["—"],
          lastSeen: "Recently",
        }));

        setProfilesWithPhoto(cleaned);
        setCurrentPage(1);
      } catch {
        toast.error("Failed to load profiles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [activeTab]);

  // REMOVE PROFILE
  const removeProfile = (id: string) =>
    setProfilesWithPhoto((prev) => prev.filter((p) => p._id !== id));

  // SEND CONNECTION
  const handleSendConnection = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      setIsSendingConnection((prev: any) => ({ ...prev, [id]: true }));

      await fetch("https://matrimonial-backend-7ahc.onrender.com/api/request/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: id }),
      });

      toast.success("Connection sent!");
      removeProfile(id);
    } finally {
      setIsSendingConnection((prev: any) => ({ ...prev, [id]: false }));
    }
  };

  // SHORTLIST
  const handleShortlist = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      setIsSendingLike((prev: any) => ({ ...prev, [id]: true }));

      await fetch("https://matrimonial-backend-7ahc.onrender.com/api/like/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: id }),
      });

      toast.success("Shortlisted!");
      removeProfile(id);
    } finally {
      setIsSendingLike((prev: any) => ({ ...prev, [id]: false }));
    }
  };

  // SKIP
  const handleNotNow = async (id: string) => {
    const token = localStorage.getItem("authToken");

    await fetch("https://matrimonial-backend-7ahc.onrender.com/api/cross/user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userIdToBlock: id }),
    });

    removeProfile(id);
    toast.success("Skipped");
  };

  if (activeTab !== "Profile with photo") return null;

  // PAGINATION
  const totalPages = Math.ceil(profilesWithPhoto.length / profilesPerPage);
  const indexLast = currentPage * profilesPerPage;
  const currentProfiles = profilesWithPhoto.slice(
    indexLast - profilesPerPage,
    indexLast
  );

  return (
<div className="space-y-14 mt-0">      {isLoading ? (
        <Loading message="Loading profiles..." />
      ) : currentProfiles.length === 0 ? (
        <div className="text-center text-gray-600">No profiles found.</div>
      ) : (
        <>
          {currentProfiles.map((user) => (
            <div
              key={user._id}
              className="p-6 bg-white rounded-lg border border-[#7D0A0A] shadow-sm
              flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              {/* IMAGE */}
              <div className="flex justify-center md:block">
                <Image
                  src={user.profileImage || "/default-avatar.png"}
                  alt={user.firstName}
                  width={96}
                  height={96}
                  className="w-28 h-28 rounded-full object-cover cursor-pointer"
                  onClick={() => router.push(`/matches/${user._id}`)}
                />
              </div>

              {/* INFO */}
              <div className="flex-1 text-center md:text-left md:px-6 space-y-1">
                <h3 className="text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </h3>

                <p className="text-sm text-gray-500 border-b pb-1">
                  {user._id} | Last seen {user.lastSeen}
                </p>

                <p className="text-sm text-gray-700">
                  {user.age} Yrs · {user.height} · {user.caste}
                </p>

                <p className="text-sm text-gray-700">
                  {user.profession} · Earns {user.salary}
                </p>

                <p className="text-sm text-gray-700">{user.education}</p>
                <p className="text-sm text-gray-700">{user.location}</p>
                <p className="text-sm text-gray-700">
                  {user.languages.join(", ")}
                </p>
              </div>

              {/* ACTION BUTTONS — RESPONSIVE GRID */}
              <div
                className="
                grid grid-cols-3 md:grid-cols-1 gap-4
                items-center text-center md:text-left md:border-l md:pl-4
              "
              >
                {/* Connection */}
                <div className="flex flex-col items-center md:flex-row gap-2">
                  <span className="text-sm">Connect</span>
                  <Button
                    disabled={isSendingConnection[user._id]}
                    onClick={() => handleSendConnection(user._id)}
                    className="bg-gradient-to-r from-green-400 to-blue-400 text-white w-10 h-10 rounded-full"
                  >
                    {isSendingConnection[user._id] ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Shortlist */}
                <div className="flex flex-col items-center md:flex-row gap-2">
                  <span className="text-sm">Like</span>
                  <Button
                    variant="outline"
                    disabled={isSendingLike[user._id]}
                    onClick={() => handleShortlist(user._id)}
                    className="w-10 h-10 rounded-full"
                  >
                    {isSendingLike[user._id] ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart className="w-4 h-4 text-red-600" />
                    )}
                  </Button>
                </div>

                {/* Not now */}
                <div className="flex flex-col items-center md:flex-row gap-2">
                  <span className="text-sm">Skip</span>
                  <Button
                    variant="outline"
                    onClick={() => handleNotNow(user._id)}
                    className="bg-gray-200 w-10 h-10 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* PAGINATION */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`px-5 py-2 text-white rounded ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#219e25] hover:bg-[#1b7f1e]"
              }`}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-5 py-2 text-white rounded ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#219e25] hover:bg-[#1b7f1e]"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
