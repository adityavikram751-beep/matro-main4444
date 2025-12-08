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
      if (!token) throw new Error("No authentication token found. Please log in.");

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
        lastSeen: p.lastSeen
          ? new Date(p.lastSeen).toLocaleString()
          : "recently",
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
      setError(err instanceof Error ? err.message : "Error fetching visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  if (loading) return <p className="text-center">Loading Profile Visitors...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (profiles.length === 0)
    return <p className="text-center py-6">No profile visitors found.</p>;

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <Card
          key={profile.id}
          className="p-6 bg-white rounded-lg border border-[#7D0A0A]"
        >
          <div className="flex items-start space-x-6">
            {/* Profile Image */}
            <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
              <Image
                src={profile.image}
                alt={profile.name}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>

            {/* Profile Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              <p className="text-sm text-gray-500">
                {profile.profileId} | {profile.lastSeen}
              </p>
              <p>
                {profile.age} Yrs · {profile.height} · {profile.caste}
              </p>
              <p>
                {profile.profession} · {profile.salary}
              </p>
              <p>{profile.education}</p>
              <p>{profile.location}</p>
              <p>{profile.languages.join(", ")}</p>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <Button className="bg-gradient-to-r from-[#2BFF88] to-[#2BD2FF] text-white rounded-full px-4 py-2">
                  Send Connection
                </Button>
                <Button className="bg-gradient-to-r from-[#FF8A00] to-[#FF2D55] text-white rounded-full px-4 py-2">
                  Shortlist
                </Button>
                <Button className="bg-gradient-to-r from-[#6C63FF] to-[#2BD2FF] text-white rounded-full px-4 py-2">
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
