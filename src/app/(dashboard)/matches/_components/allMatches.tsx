"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Send, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "../../../../Loading";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AllMatchesProps {
  activeTab: string;
}

export default function AllMatches({ activeTab }: AllMatchesProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("Success");

  const [isSendingConnection, setIsSendingConnection] = useState<any>({});
  const [isSendingLike, setIsSendingLike] = useState<any>({});

  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 10;

  const router = useRouter();

  const calculateAge = (dob: string) => {
    if (!dob) return "—";
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return "—";
    return new Date().getFullYear() - birthDate.getFullYear();
  };

  const fetchAllMatches = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

      setIsLoadingMatches(true);

      const response = await fetch(
        "https://matrimonial-backend-7ahc.onrender.com/api/like/profileMatch",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch matches");

      const data = await response.json();
      if (!data.success || !data.users) throw new Error("Invalid response format");

      const cleaned = data.users.map((user: any) => ({
        id: user._id,
        profileId: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        image: user.profileImage || "/no-img.png",
        age: calculateAge(user.dateOfBirth),
        height: user.height || "—",
        caste: user.caste || "—",
        profession: user.designation || "—",
        salary: user.annualIncome || "—",
        education: user.highestEducation || "—",
        location: `${user.city}${user.state ? ", " + user.state : ""}${
          user.country ? ", " + user.country : ""
        }`,
        languages: [user.motherTongue || "—"],
        lastSeen: "Recently",
      }));

      setMatches(cleaned);
    } catch {
      toast.error("Failed to load matches");
    } finally {
      setIsLoadingMatches(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Profile Match") {
      fetchAllMatches();
      setCurrentPage(1);
    }
  }, [activeTab]);

  const removeProfile = (id: string) => {
    setMatches((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSendConnection = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");

      setIsSendingConnection((prev) => ({ ...prev, [id]: true }));

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
      setIsSendingConnection((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleShortlist = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");

      setIsSendingLike((prev) => ({ ...prev, [id]: true }));

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
      setIsSendingLike((prev) => ({ ...prev, [id]: false }));
    }
  };

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

  const totalPages = Math.ceil(matches.length / profilesPerPage);
  const indexOfLast = currentPage * profilesPerPage;
  const indexOfFirst = indexOfLast - profilesPerPage;
  const currentMatches = matches.slice(indexOfFirst, indexOfLast);

  return (
    <>
      {/* DIALOG BOX */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {activeTab !== "Profile Match" ? null : (
        <div className="space-y-14 mt-0">

          {isLoadingMatches ? (
            <Loading message="Loading matches..." />
          ) : currentMatches.length > 0 ? (
            currentMatches.map((profile) => (
              <div
                key={profile.id}
                className="p-6 bg-white rounded-lg border border-[#7D0A0A] shadow-sm 
                flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              >
                {/* IMAGE */}
                <div className="flex justify-center md:block">
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    width={96}
                    height={96}
                    className="w-28 h-28 rounded-full object-cover cursor-pointer"
                    onClick={() => router.push(`/matches/${profile.id}`)}
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 text-center md:text-left md:px-6">
                  <h3 className="text-lg font-semibold">{profile.name}</h3>

                  <p className="text-sm text-gray-500 border-b mt-1 pb-1">
                    {profile.profileId} | Last seen {profile.lastSeen}
                  </p>

                  <p className="text-sm text-gray-700 mt-1">
                    {profile.age} Yrs · {profile.height} · {profile.caste}
                  </p>

                  <p className="text-sm text-gray-700">{profile.profession} · Earns {profile.salary}</p>
                  <p className="text-sm text-gray-700">{profile.education}</p>
                  <p className="text-sm text-gray-700">{profile.location}</p>
                  <p className="text-sm text-gray-700">{profile.languages.join(", ")}</p>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-1 gap-4 items-center text-center md:text-left 
                md:border-l md:pl-4">

                  {/* Connection */}
                  <div className="flex flex-col items-center md:flex-row md:items-center gap-2">
                    <span className="text-sm">Connect</span>
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
                  <div className="flex flex-col items-center md:flex-row md:items-center gap-2">
                    <span className="text-sm">Like</span>
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

                  {/* Skip */}
                  <div className="flex flex-col items-center md:flex-row md:items-center gap-2">
                    <span className="text-sm">Skip</span>
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
            <div className="text-center text-gray-500">No matches found.</div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">

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

              <span className="text-gray-700">
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
          )}

        </div>
      )}
    </>
  );
}
