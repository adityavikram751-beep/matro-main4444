"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Send, Heart, X } from "lucide-react";
import Loading from "../../../../Loading";
import { useRouter } from "next/navigation";

interface RecommendedProfile {
  _id: string;
  name: string;
  age: number;
  location: string;
  profileImage: string;
  lastSeen: string;
  height?: string;
  religion?: string;
  profession?: string;
  salary?: string;
  education?: string;
  languages?: string[];
  gender?: string;
}

export default function Recommendation({ activeTab }: { activeTab: string }) {
  const [profiles, setProfiles] = useState<RecommendedProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const [isSendingConnection, setIsSendingConnection] = useState<{ [key: string]: boolean }>({});
  const [isSendingLike, setIsSendingLike] = useState<{ [key: string]: boolean }>({});

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const router = useRouter();

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Unauthorized");

      setLoading(true);

      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/partner/match", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!data.success) throw new Error("Failed to fetch");

      const cleaned = data.users.map((p: any) => {
        const dob = new Date(p.dateOfBirth);
        const age = isNaN(dob.getTime())
          ? 0
          : new Date().getFullYear() - dob.getFullYear();

        return {
          _id: p._id,
          name: `${p.firstName} ${p.lastName}`.trim(),
          age,
          location: [p.city, p.state, p.country].filter(Boolean).join(", "),
          profileImage: p.profileImage || "/default-avatar.png",
          height: p.height || "",
          religion: p.religion || "",
          profession: p.designation || "",
          salary: p.annualIncome || "",
          education: p.highestEducation || "",
          languages: p.motherTongue ? [p.motherTongue] : [],
          lastSeen: "Recently",
        };
      });

      setProfiles(cleaned);
      setCurrentPage(1);
    } catch (err) {
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Preference") {
      fetchProfiles();
    }
  }, [activeTab]);

  // PAGINATION
  const totalPages = Math.ceil(profiles.length / limit);
  const currentData = profiles.slice((currentPage - 1) * limit, currentPage * limit);

  const removeProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p._id !== id));
  };

  // SEND CONNECTION
  const handleSendConnection = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");

      setIsSendingConnection((prev) => ({ ...prev, [id]: true }));

      await fetch("https://matrimonial-backend-7ahc.onrender.com/api/request/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: id }),
      });

      toast.success("Connection Sent");
      removeProfile(id);
    } catch {
      toast.error("Connection Failed");
    } finally {
      setIsSendingConnection((prev) => ({ ...prev, [id]: false }));
    }
  };

  // SHORTLIST
  const handleShortlist = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");

      setIsSendingLike((prev) => ({ ...prev, [id]: true }));

      await fetch("https://matrimonial-backend-7ahc.onrender.com/api/like/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: id }),
      });

      toast.success("Shortlisted");
      removeProfile(id);
    } catch {
      toast.error("Failed");
    } finally {
      setIsSendingLike((prev) => ({ ...prev, [id]: false }));
    }
  };

  // NOT NOW
  const handleNotNow = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");

      await fetch("https://matrimonial-backend-7ahc.onrender.com/api/cross/user", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ userIdToBlock: id }),
      });

      toast.success("Skipped");
      removeProfile(id);
    } catch {
      toast.error("Failed");
    }
  };

  if (activeTab !== "Preference") return null;

  return (
    <div className="space-y-6 mt-6">
      {loading ? (
        <Loading message="Loading recommended profiles..." />
      ) : currentData.length === 0 ? (
        <div className="text-center text-gray-600">No recommendations found.</div>
      ) : (
        <>
          {currentData.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between p-6 bg-white rounded-lg border border-[#7D0A0A] shadow-sm"
            >
              {/* IMAGE */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border">
                <Image
                  src={p.profileImage}
                  alt={p.name}
                  width={96}
                  height={96}
                  unoptimized
                  className="object-cover w-full h-full cursor-pointer"
                  onClick={() => router.push(`/matches/${p._id}`)}
                />
              </div>

              {/* INFO */}
              <div className="flex-1 px-6">
                <h3 className="text-lg font-semibold">{p.name}</h3>

                <p className="text-sm text-gray-500 border-b mt-2">
                  {p._id} | Last seen {p.lastSeen}
                </p>

                <p className="text-sm text-gray-700">
                  {p.age} Yrs · {p.height} · {p.religion}
                </p>

                <p className="text-sm text-gray-700">
                  {p.profession} · Earns {p.salary}
                </p>

                <p className="text-sm text-gray-700">{p.education}</p>
                <p className="text-sm text-gray-700">{p.location}</p>

                <p className="text-sm text-gray-700">
                  {p.languages?.join(", ")}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-4 items-center min-w-[250px] border-l pl-4">

                {/* CONNECT */}
                <Button
                  disabled={isSendingConnection[p._id]}
                  onClick={() => handleSendConnection(p._id)}
                  className="bg-gradient-to-r from-green-400 to-blue-400 text-white w-10 h-10 rounded-full"
                >
                  {isSendingConnection[p._id] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>

                {/* SHORTLIST */}
                <Button
                  variant="outline"
                  disabled={isSendingLike[p._id]}
                  onClick={() => handleShortlist(p._id)}
                  className="w-10 h-10 rounded-full"
                >
                  {isSendingLike[p._id] ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4 text-red-600" />
                  )}
                </Button>

                {/* SKIP */}
                <Button
                  variant="outline"
                  onClick={() => handleNotNow(p._id)}
                  className="bg-gray-200 w-10 h-10 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </Button>

              </div>
            </div>
          ))}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className={`px-5 py-2 text-white rounded 
                  ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-[#219e25] hover:bg-[#1b7f1e]"}
                `}
              >
                Previous
              </button>

              <span>Page {currentPage} of {totalPages}</span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`px-5 py-2 text-white rounded 
                  ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-[#219e25] hover:bg-[#1b7f1e]"}
                `}
              >
                Next
              </button>
            </div>
          )}

        </>
      )}
    </div>
  );
}
