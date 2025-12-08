"use client";
import { useState, useEffect } from "react";
import NavigationTabs from "./_components/NavigationTabs";

import { getFilteredProfiles } from "@/utils/profileFilters";
import { toast } from "sonner";
import { Profile } from "@/types/Profile";
import Recommendation from "./_components/Recommended";
import AllMatches from "./_components/allMatches";
import MutualMatch from "./_components/MutualMatch";
import NewlyMatched from "./_components/NewlyMatch";
import ProfilePhoto from "./_components/ProfilePhoto";

export default function MatrimonialApp() {
  const [activeTab, setActiveTab] = useState("Profile Match");
  const [matches, setMatches] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { name: "Profile Match", count: null },
    { name: "Preference", count: null },
    { name: "Profile with photo", count: null },
    { name: "New Profile", count: null },
    { name: "Mutual Match", count: null },
  ];

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          "https://matrimonial-backend-7ahc.onrender.com/api/message/AllUser",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        const data = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];

        const mappedProfiles = data
          .map((user: any) => ({
            id: user._id || "",
            name: user.name || "Unknown",
            profileId: user.profileId || "",
            lastSeen: user.lastSeen || "recently",
            age: user.age || 0,
            height: user.height || "",
            caste: user.caste || "",
            profession: user.profession || "",
            salary: user.salary || "",
            education: user.education || "",
            location: user.location || "",
            languages: user.languages || [],
            image: user.image || "/default-avatar.png",
            isNew: true,
            hasPhoto: !!user.image,
            isMutual: false,
            isVerified: false,
          }))
          .filter(Boolean);

        setMatches(mappedProfiles);
      } catch (err) {
        console.error("Failed to fetch matches:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch matches"
        );
        toast.error("Failed to load matches. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ⭐ SECOND TOP BAR (TABS) FIXED BELOW MAIN NAV */}
      <div className="fixed top-[60px] left-0 w-full z-40 bg-white border-b shadow-sm">
        <NavigationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />
      </div>

      {/* ⭐ MAIN CONTENT (padding so fixed tabbar doesn’t overlap) */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 pt-[60px]">

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <>
            <Recommendation activeTab={activeTab} />
            <AllMatches activeTab={activeTab} />
            <MutualMatch activeTab={activeTab} />
            <NewlyMatched activeTab={activeTab} />
            <ProfilePhoto activeTab={activeTab} />
          </>
        )}

      </div>
    </div>
  );
}
