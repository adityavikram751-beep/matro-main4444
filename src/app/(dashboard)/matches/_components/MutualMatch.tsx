"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Send, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MutualMatchesProps {
  activeTab: string;
}

export default function MutualMatches({ activeTab }: MutualMatchesProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isSendingConnection, setIsSendingConnection] = useState<any>({});
  const [isSendingLike, setIsSendingLike] = useState<any>({});

  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 10;

  const router = useRouter();

  // ⭐ AGE
  const calculateAge = (dob: string) => {
    if (!dob) return "—";
    const d = new Date(dob);
    if (isNaN(d.getTime())) return "—";
    return new Date().getFullYear() - d.getFullYear();
  };

  // ⭐ FETCH MUTUAL MATCHES
  const fetchMutualMatches = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

      setIsLoading(true);

      const res = await fetch(
        "https://matrimonial-backend-7ahc.onrender.com/api/mutual-matches",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch mutual matches");

      const data = await res.json();

      const formatted = data.mutualMatches.map((u: any) => ({
        id: u._id,
        profileId: u.id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        image: u.profileImage || "/no-img.png",
        age: calculateAge(u.dateOfBirth),
        height: u.height || "—",
        caste: u.caste || "—",
        profession: u.designation || "—",
        salary: u.annualIncome || "—",
        education: u.highestEducation || "—",
        location: `${u.city || ""}${u.state ? ", " + u.state : ""}${
          u.country ? ", " + u.country : ""
        }`,
        languages: [u.motherTongue || "—"],
        lastSeen: "Recently",
      }));

      setMatches(formatted);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐ RUN API ON TAB CHANGE
  useEffect(() => {
    if (activeTab === "Mutual Match") {
      fetchMutualMatches();
      setCurrentPage(1);
    }
  }, [activeTab]);

  // ⭐ REMOVE PROFILE
  const removeProfile = (id: string) => {
    setMatches((prev) => prev.filter((p) => p.id !== id));
  };

  // ⭐ SEND CONNECTION
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

      toast.success("Connection sent!");
      removeProfile(id);
    } finally {
      setIsSendingConnection((prev: any) => ({ ...prev, [id]: false }));
    }
  };

  // ⭐ SHORTLIST
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

  // ⭐ NOT NOW
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
      toast.error("Failed to skip");
    }
  };

  // ⭐ PAGINATION
  const totalPages = Math.ceil(matches.length / profilesPerPage);
  const indexLast = currentPage * profilesPerPage;
  const indexFirst = indexLast - profilesPerPage;
  const currentProfiles = matches.slice(indexFirst, indexLast);

  if (activeTab !== "Mutual Match") return null;

  return (
    <div className="space-y-6 mt-6">
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-t-transparent border-black rounded-full animate-spin" />
        </div>
      ) : currentProfiles.length > 0 ? (
        currentProfiles.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between p-6 bg-white rounded-lg border border-[#7D0A0A] shadow-sm"
          >
            {/* IMAGE */}
            <div className="flex-shrink-0">
              <Image
                src={profile.image}
                alt={profile.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover cursor-pointer"
                onClick={() => router.push(`/matches/${profile.id}`)}
              />
            </div>

            {/* INFO */}
            <div className="flex-1 px-6">
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              <p className="text-sm text-gray-500 border-b mt-2">
                {profile.profileId} | Last seen {profile.lastSeen}
              </p>

              <p className="text-sm text-gray-700">
                {profile.age} Yrs · {profile.height} · {profile.caste}
              </p>

              <p className="text-sm text-gray-700">
                {profile.profession} · Earns {profile.salary}
              </p>

              <p className="text-sm text-gray-700">{profile.education}</p>
              <p className="text-sm text-gray-700">{profile.location}</p>
              <p className="text-sm text-gray-700">{profile.languages.join(", ")}</p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-4 items-center min-w-[250px] border-l pl-4">
              
              {/* Connection */}
              <div className="flex items-center gap-4">
                <span className="text-sm">Connection</span>
                <Button
                  disabled={isSendingConnection[profile.id]}
                  onClick={() => handleSendConnection(profile.id)}
                  className="bg-gradient-to-r from-green-400 to-blue-400 text-white w-10 h-10 rounded-full"
                >
                  {isSendingConnection[profile.id] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Shortlist */}
              <div className="flex items-center gap-4">
                <span className="text-sm">Shortlist</span>
                <Button
                  variant="outline"
                  disabled={isSendingLike[profile.id]}
                  onClick={() => handleShortlist(profile.id)}
                  className="w-10 h-10 rounded-full"
                >
                  {isSendingLike[profile.id] ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4 text-red-600" />
                  )}
                </Button>
              </div>

              {/* Not Now */}
              <div className="flex items-center gap-4">
                <span className="text-sm">Not Now</span>
                <Button
                  variant="outline"
                  onClick={() => handleNotNow(profile.id)}
                  className="w-10 h-10 rounded-full bg-gray-200"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">No mutual matches.</div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
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

          <span>Page {currentPage} of {totalPages}</span>

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
      )}
    </div>
  );
}
