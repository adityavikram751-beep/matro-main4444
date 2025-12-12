"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

export default function ProfileVisitor() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

      const res = await fetch(
        "https://matrimonial-backend-7ahc.onrender.com/api/profile/view/viewed-me",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch profile visitors");

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
        languages:
          typeof p.languages === "string"
            ? p.languages.split(",").map((l) => l.trim())
            : Array.isArray(p.languages)
            ? p.languages
            : [],
        image: p.profileImage || "/placeholder.svg",
      }));

      setProfiles(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // ================== UI STATES ==================
  if (loading) return <p className="text-center py-4">Loading Profile Visitors...</p>;
  if (error) return <p className="text-center text-red-500 py-4">{error}</p>;
  if (profiles.length === 0) return <p className="text-center py-6">No profile visitors found.</p>;

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <Card
          key={profile.id}
          className="p-4 sm:p-6 bg-white rounded-lg border border-[#7D0A0A]"
        >
          <div
            className="
              flex 
              flex-col sm:flex-row 
              gap-4 sm:gap-6
              sm:items-start
            "
          >
            {/* Profile Image */}
            <div className="flex justify-center sm:block">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-gray-300">
                <Image
                  src={profile.image}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold">{profile.name}</h3>

              <p className="text-sm text-gray-500">
                {profile.profileId} • {profile.lastSeen}
              </p>

              <p className="text-sm mt-1">
                {profile.age} Yrs · {profile.height} · {profile.caste}
              </p>

              <p className="text-sm">{profile.profession} · {profile.salary}</p>
              <p className="text-sm">{profile.education}</p>
              <p className="text-sm">{profile.location}</p>

              <p className="text-sm text-gray-700">{profile.languages.join(", ")}</p>

              {/* Action Buttons */}
              <div
                className="
                  flex flex-wrap 
                  gap-3 sm:gap-4 
                  mt-4
                "
              >
                <Button className="
                  bg-gradient-to-r from-[#2BFF88] to-[#2BD2FF]
                  text-white 
                  rounded-full 
                  px-4 py-2
                  text-sm
                ">
                  Send Connection
                </Button>

                <Button className="
                  bg-gradient-to-r from-[#FF8A00] to-[#FF2D55]
                  text-white 
                  rounded-full 
                  px-4 py-2
                  text-sm
                ">
                  Shortlist
                </Button>

                <Button className="
                  bg-gradient-to-r from-[#6C63FF] to-[#2BD2FF]
                  text-white 
                  rounded-full 
                  px-4 py-2
                  text-sm
                ">
                  Not Now
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
