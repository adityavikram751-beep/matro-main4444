"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { Send, Heart, X } from "lucide-react";

interface ApiProfile {
  id: string;
  _id: string;
  name: string;
  age: number;
  height: string;
  caste: string;
  designation: string;
  religion: string;
  salary: string;
  education: string;
  location: string;
  languages: string | string[];
  gender: string;
  profileImage: string;
  lastSeen?: string;
}

interface Profile {
  id: string;
  name: string;
  profileId: string;
  lastSeen: string;
  age: number;
  height: string;
  caste: string;
  profession: string;
  salary: string;
  education: string;
  location: string;
  languages: string[];
  image: string;
}

export default function ProfileIVisit() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendingConnection, setIsSendingConnection] = useState<{ [key: string]: boolean }>({});
  const [isSendingLike, setIsSendingLike] = useState<{ [key: string]: boolean }>({});

  const fetchIVisited = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/profile/view/i-viewed", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch profiles");

      const data = await res.json();

      const mapped = data.data.map((p: ApiProfile) => ({
        id: p._id,
        name: p.name,
        profileId: p.id,
        lastSeen: p.lastSeen ? new Date(p.lastSeen).toLocaleString() : "recently",
        age: p.age,
        height: p.height,
        caste: p.caste,
        profession: p.designation,
        salary: p.salary,
        education: p.education,
        location: p.location,
        languages: Array.isArray(p.languages)
          ? p.languages
          : typeof p.languages === "string"
          ? p.languages.split(",").map((l) => l.trim())
          : [],
        image: p.profileImage || "/placeholder.svg",
      }));

      setProfiles(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching visited profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIVisited();
  }, []);

  // ================= ACTION HANDLERS =================
  const handleSendConnection = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token");

      setIsSendingConnection((prev) => ({ ...prev, [id]: true }));

      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/request/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId: id }),
      });

      const data = await res.json();

      if (!res.ok) toast.error(data.message || "Failed to send connection");
      else toast.success("Connection request sent.");

      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to send connection");
    } finally {
      setIsSendingConnection((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleShortlist = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token");

      setIsSendingLike((prev) => ({ ...prev, [id]: true }));

      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/like/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: id }),
      });

      const data = await res.json();

      if (data.success || data.message === "Already liked") toast.success("Shortlisted.");
      else toast.error(data.message || "Failed to shortlist");

      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Shortlist failed");
    } finally {
      setIsSendingLike((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleNotNow = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token");

      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/cross/user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userIdToBlock: id }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      toast.success("Profile skipped");
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to skip profile");
    }
  };

  // ================ UI STATES ================
  if (loading) return <p className="text-center py-6">Loading Profiles I Visited...</p>;
  if (error) return <p className="text-center text-red-500 py-6">{error}</p>;
  if (profiles.length === 0) return <p className="text-center py-6">No profiles found.</p>;

  return (
    <div className="space-y-4">

      {profiles.map((profile) => (
        <Card
          key={profile.id}
          className="
            p-4 sm:p-6 
            bg-white 
            rounded-lg 
            border border-[#7D0A0A]
          "
        >
          <div
            className="
              flex flex-col 
              sm:flex-row 
              sm:items-start 
              sm:justify-between 
              gap-6
            "
          >
            {/* -------- LEFT: Profile Info -------- */}
            <div className="flex gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border">
                <Image
                  src={profile.image}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold">{profile.name}</h3>
                <p className="text-sm text-gray-500">{profile.profileId} · {profile.lastSeen}</p>
                <p className="text-sm">{profile.age} Years · {profile.height} · {profile.caste}</p>
                <p className="text-sm">{profile.profession} · {profile.salary}</p>
                <p className="text-sm">{profile.education}</p>
                <p className="text-sm">{profile.location}</p>
                <p className="text-sm text-gray-700">{profile.languages.join(", ")}</p>
              </div>
            </div>

            {/* -------- RIGHT: Actions -------- */}
            <div
              className="
                flex 
                sm:flex-col 
                justify-between 
                gap-4 
                sm:gap-6 
                pt-2 
                border-t sm:border-t-0 
                sm:border-l 
                sm:pl-4 
              "
            >
              {/* Connection */}
              <div className="flex items-center gap-4">
                <span className="text-sm">Connection</span>
                <Button
                  disabled={isSendingConnection[profile.id]}
                  onClick={() => handleSendConnection(profile.id)}
                  className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center"
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
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

    </div>
  );
}
