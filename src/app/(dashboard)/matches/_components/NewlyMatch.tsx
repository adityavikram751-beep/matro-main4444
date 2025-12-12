"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Send, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "../../../../Loading";

interface NewlyMatchedUser {
  _id: string;
  firstName: string;
  lastName: string;
  annualIncome: string;
  caste: string;
  city: string;
  dateOfBirth: string;
  designation: string;
  gender: string;
  height: string;
  highestEducation: string;
  motherTongue: string;
  profileImage: string;
  religion: string;
  state: string;
}

export default function NewlyMatched({ activeTab }: { activeTab: string }) {
  const [newlyMatched, setNewlyMatched] = useState<NewlyMatchedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const [isSendingConnection, setIsSendingConnection] = useState<any>({});
  const [isSendingLike, setIsSendingLike] = useState<any>({});

  const router = useRouter();

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 10;

  // FETCH NEW USERS
  useEffect(() => {
    if (activeTab !== "New Profile") return;

    const fetchNewUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        setIsLoading(true);

        const response = await fetch(
          "https://matrimonial-backend-7ahc.onrender.com/api/profile/newly-user",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) throw new Error(data.message);
        setNewlyMatched(data.users || []);
        setCurrentPage(1);
      } catch {
        toast.error("Failed to load newly matched users.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewUsers();
  }, [activeTab]);

  // AGE
  const calculateAge = (dob: string) => {
    if (!dob) return "—";
    const d = new Date(dob);
    return new Date().getFullYear() - d.getFullYear();
  };

  // REMOVE PROFILE
  const removeProfile = (id: string) => {
    setNewlyMatched((prev) => prev.filter((u) => u._id !== id));
  };

  // ACTION: SEND CONNECTION
  const handleSendConnection = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      setIsSendingConnection((prev: any) => ({ ...prev, [id]: true }));

      await fetch("https://matrimonial-backend-7ahc.onrender.com/api/request/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: id }),
      });

      toast.success("Connection request sent");
      removeProfile(id);
    } finally {
      setIsSendingConnection((prev: any) => ({ ...prev, [id]: false }));
    }
  };

  // ACTION: SHORTLIST
  const handleShortlist = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      setIsSendingLike((prev: any) => ({ ...prev, [id]: true }));

      await fetch("https://matrimonial-backend-7ahc.onrender.com/api/like/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: id }),
      });

      toast.success("Shortlisted");
      removeProfile(id);
    } finally {
      setIsSendingLike((prev: any) => ({ ...prev, [id]: false }));
    }
  };

  // ACTION: NOT NOW
  const handleNotNow = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");

      await fetch("https://matrimonial-backend-7ahc.onrender.com/api/cross/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIdToBlock: id }),
      });

      toast.success("Profile skipped");
      removeProfile(id);
    } catch {
      toast.error("Failed to skip profile");
    }
  };

  if (activeTab !== "New Profile") return null;

  // PAGINATION
  const totalPages = Math.ceil(newlyMatched.length / profilesPerPage);
  const indexLast = currentPage * profilesPerPage;
  const currentProfiles = newlyMatched.slice(indexLast - profilesPerPage, indexLast);

  return (
<div className="space-y-14 mt-0">
      {/* LOADING */}
      {isLoading ? (
        <Loading message="Loading new profiles..." />
      ) : currentProfiles.length === 0 ? (
        <div className="text-center text-gray-600">No new profiles found.</div>
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
                  {user._id} | Last seen recently
                </p>

                <p className="text-sm text-gray-700">
                  {calculateAge(user.dateOfBirth)} Yrs · {user.height} · {user.caste}
                </p>

                <p className="text-sm text-gray-700">
                  {user.designation} · Earns {user.annualIncome}
                </p>

                <p className="text-sm text-gray-700">{user.highestEducation}</p>
                <p className="text-sm text-gray-700">{user.city}, {user.state}</p>
                <p className="text-sm text-gray-700">{user.motherTongue}</p>
              </div>

              {/* ACTION BUTTONS — RESPONSIVE GRID */}
              <div className="
                grid grid-cols-3 md:grid-cols-1 gap-4 
                items-center text-center md:text-left md:border-l md:pl-4
              ">
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

                {/* Not Now */}
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
                currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-[#219e25] hover:bg-[#1b7f1e]"
              }`}
            >
              Previous
            </button>

            <span>Page {currentPage} of {totalPages}</span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-5 py-2 text-white rounded ${
                currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-[#219e25] hover:bg-[#1b7f1e]"
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
