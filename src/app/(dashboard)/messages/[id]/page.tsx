"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Check,
  Heart,
  Star,
  MapPin,
  Clock,
  User,
  Home,
  Briefcase,
  GraduationCap,
  Users,
  Calendar,
  Moon,
} from "lucide-react";
import Image from "next/image";

interface Horoscope {
  rashi?: string;
  nakshatra?: string;
  manglik?: string;
  matchRequired?: string;
}

interface Profile {
  _id?: string;
  id?: string;
  name?: string;
  profileImage?: string;
  age?: string;
  height?: string;
  motherTongue?: string;
  profileCreatedBy?: string;
  maritalStatus?: string;
  location?: string;
  eatingHabits?: string;
  religion?: string;
  gotra?: string;
  employedIn?: string;
  annualIncome?: string;
  education?: string;
  designation?: string;
  familyStatus?: string;
  familyType?: string;
  aboutYourself?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  lastSeen?: string;
  horoscope?: Horoscope;
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [astroOpen, setAstroOpen] = useState(false);

  const params = useParams() as { id?: string } | undefined;
  const id = params?.id;
  const fallbackImage =
    "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/profile/users/${id}`
        );
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        if (data.success) setProfileData(data.profile);
        else setError("Failed to fetch profile data");
      } catch (err: any) {
        setError(err?.message || "Error fetching profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const personalDetails = profileData
    ? [
        { label: "Age", value: profileData.age, icon: <User className="w-4 h-4" /> },
        { label: "Height", value: profileData.height, icon: <User className="w-4 h-4" /> },
        {
          label: "Spoken Languages",
          value: profileData.motherTongue,
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: "Profile Created By",
          value: profileData.profileCreatedBy,
          icon: <User className="w-4 h-4" />,
        },
        { label: "Marital Status", value: profileData.maritalStatus, icon: <Heart className="w-4 h-4" /> },
        { label: "Lives In", value: profileData.location || "Not Specified", icon: <MapPin className="w-4 h-4" /> },
        { label: "Eating Habits", value: profileData.eatingHabits, icon: <Users className="w-4 h-4" /> },
        { label: "Religion", value: profileData.religion, icon: <Star className="w-4 h-4" /> },
        { label: "Gothra", value: profileData.gotra, icon: <Star className="w-4 h-4" /> },
        {
          label: "Dosha",
          value: profileData.horoscope?.manglik === "false" ? "No Dosha" : "Manglik",
          icon: <Moon className="w-4 h-4" />,
        },
        { label: "Employment", value: profileData.employedIn, icon: <Briefcase className="w-4 h-4" /> },
        { label: "Annual Income", value: profileData.annualIncome, icon: <Briefcase className="w-4 h-4" /> },
        { label: "Education", value: profileData.education, icon: <GraduationCap className="w-4 h-4" /> },
        { label: "Occupation", value: profileData.designation, icon: <Briefcase className="w-4 h-4" /> },
      ]
    : [];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading profile…</div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top responsive header: mobile condensed, desktop full */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-28 md:h-28 rounded-full overflow-hidden flex-shrink-0 border">
              <Image
                src={profileData?.profileImage || fallbackImage}
                alt={profileData?.name || "Profile"}
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-semibold">{profileData?.name || "User"}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 mt-1">
                <span>ID: {profileData?.id || "N/A"}</span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Last seen: {profileData?.lastSeen || "N/A"}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setAstroOpen(true)}
                className="hidden md:inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"
              >
                <img src="/Images/Astro.png" alt="Astro" className="w-4 h-4" />
                <span className="text-sm">Astro</span>
              </button>

              <button className="inline-flex items-center gap-2 bg-red-700 text-white px-3 py-2 rounded-lg hover:bg-red-800">
                <img src="/Images/You&Me.png" alt="You & Me" className="w-4 h-4" />
                <span className="text-sm">You & Him</span>
              </button>

              <button className="ml-2 inline-flex items-center justify-center bg-emerald-400 text-white rounded-full w-10 h-10 hover:scale-105">
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column (profile card + quick info) */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="text-center">
                <div className="w-36 h-36 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden border mb-4">
                  <Image
                    src={profileData?.profileImage || fallbackImage}
                    alt={profileData?.name || "Profile"}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="inline-block bg-pink-50 border rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm md:text-base">
                    <span className="font-semibold">Verified Profile</span>
                    <img src="/Images/blue tick.png" alt="tick" className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Name verified against Govt ID</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="text-lg font-semibold mb-3">Basic Info</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex justify-between">
                  <span className="text-gray-500">Age</span>
                  <span className="font-medium">{profileData?.age || "-"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Height</span>
                  <span className="font-medium">{profileData?.height || "-"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Language</span>
                  <span className="font-medium">{profileData?.motherTongue || "-"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium">{profileData?.location || "-"}</span>
                </li>
              </ul>
            </div>
          </aside>

          {/* Middle/Right combined column */}
          <main className="lg:col-span-2 space-y-6">
            {/* Personal Details grid */}
            <section className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Personal Details</h2>
                <button
                  className="text-sm text-indigo-600 hover:underline"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personalDetails.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-purple-600 mt-1">{d.icon}</div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600">{d.label}</p>
                      <p className="font-medium truncate text-gray-800">{d.value || "Not Specified"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Family Info */}
            <section className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Family Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-purple-600 mt-1">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Family Status</p>
                    <p className="font-medium text-gray-800">{profileData?.familyStatus || "Not Specified"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-purple-600 mt-1">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Family Type</p>
                    <p className="font-medium text-gray-800">{profileData?.familyType || "Not Specified"}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* About */}
            <section className="bg-white rounded-2xl shadow p-4">
              <h2 className="text-lg font-semibold mb-3">About Myself</h2>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {profileData?.aboutYourself || "No description available."}
                </p>
              </div>
            </section>

            {/* Horoscope */}
            <section className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Horoscope</h2>
                <button
                  onClick={() => setAstroOpen((s) => !s)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {astroOpen ? "Hide" : "View"}
                </button>
              </div>

              <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 ${astroOpen ? "" : "md:grid-cols-2"}`}>
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-purple-600 mt-1">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Date of Birth</p>
                    <p className="font-medium text-gray-800">{profileData?.dateOfBirth || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-purple-600 mt-1">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Time of Birth</p>
                    <p className="font-medium text-gray-800">{profileData?.timeOfBirth || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-purple-600 mt-1">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Zodiac (Rashi)</p>
                    <p className="font-medium text-gray-800">{profileData?.horoscope?.rashi || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-purple-600 mt-1">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Nakshatra</p>
                    <p className="font-medium text-gray-800">{profileData?.horoscope?.nakshatra || "Not Specified"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-emerald-700 text-sm">
                  <strong>Note:</strong> {profileData?.horoscope?.matchRequired || "Horoscope match information not available"}
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
