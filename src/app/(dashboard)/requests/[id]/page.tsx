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

function ProfilePage() {
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [astroOpen, setAstroOpen] = useState(false);

  const { id } = useParams();
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
        const response = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/profile/users/${id}`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        if (data.success) {
          setProfileData(data.profile);
        } else {
          setError("Failed to fetch profile data");
        }
      } catch (err: any) {
        setError(err.message || "Error fetching profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const personalDetails = profileData
    ? [
        {
          label: "Age",
          value: profileData.age,
          icon: <User className="w-4 h-4" />,
        },
        {
          label: "Height",
          value: profileData.height,
          icon: <User className="w-4 h-4" />,
        },
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
        {
          label: "Marital Status",
          value: profileData.maritalStatus,
          icon: <Heart className="w-4 h-4" />,
        },
        {
          label: "Lives In",
          value: profileData.location || "Not Specified",
          icon: <MapPin className="w-4 h-4" />,
        },
        {
          label: "Eating Habits",
          value: profileData.eatingHabits,
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: "Religion",
          value: profileData.religion,
          icon: <Star className="w-4 h-4" />,
        },
        {
          label: "Gothra",
          value: profileData.gotra,
          icon: <Star className="w-4 h-4" />,
        },
        {
          label: "Dosha",
          value: profileData.horoscope?.manglik === "false" ? "No Dosha" : "Manglik",
          icon: <Moon className="w-4 h-4" />,
        },
        {
          label: "Employment",
          value: profileData.employedIn,
          icon: <Briefcase className="w-4 h-4" />,
        },
        {
          label: "Annual Income",
          value: profileData.annualIncome,
          icon: <Briefcase className="w-4 h-4" />,
        },
        {
          label: "Education",
          value: profileData.education,
          icon: <GraduationCap className="w-4 h-4" />,
        },
        {
          label: "Occupation",
          value: profileData.designation,
          icon: <Briefcase className="w-4 h-4" />,
        },
      ]
    : [];
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-['Inter',system-ui,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* ───────── MOBILE HEADER ───────── */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
                {profileData?.name || "User"}
              </h1>
              <p className="text-sm text-gray-500 break-words">
                ID: {profileData?.id || "N/A"}
              </p>
            </div>

            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={profileData?.profileImage || fallbackImage}
                alt={profileData?.name || "Profile"}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* ───────── MAIN LAYOUT (RESPONSIVE) ───────── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:w-1/3 space-y-6">

            {/* Profile Picture + Verification (Desktop Only) */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center">
                
                <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-4">
                  <Image
                    src={profileData?.profileImage || fallbackImage}
                    alt={profileData?.name || "Profile"}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover rounded-full border-4 object-center"
                  />
                </div>

                <div className="bg-[#FFEDFA] border rounded-xl p-3 md:p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-black flex-wrap">
                    <span className="font-semibold text-sm md:text-base text-center">
                      Verified Profile
                    </span>
                    <img
                      src="/Images/blue tick.png"
                      alt="blue tick"
                      className="w-4 h-4 md:w-5 md:h-5"
                    />
                  </div>
                  <p className="text-xs md:text-sm text-black mt-1 text-center">
                    Name verified against Govt ID
                  </p>
                </div>

              </div>
            </div>

          </div>
          {/* RIGHT COLUMN */}
          <div className="lg:w-2/3 space-y-6">

            {/* ───────── DESKTOP HEADER ───────── */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">

                {/* LEFT SIDE */}
                <div className="min-w-[200px]">
                  <h1 className="text-2xl xl:text-3xl font-bold text-gray-800 break-words">
                    {profileData?.name || "User"}
                  </h1>
                  <p className="text-gray-500 break-words">
                    ID: {profileData?.id || "N/A"}
                  </p>

                  <p className="text-emerald-600 flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4" />
                    Last seen: {profileData?.lastSeen || "N/A"}
                  </p>
                </div>

                {/* RIGHT SIDE BUTTONS */}
                <div className="flex items-center gap-4 flex-wrap">

                  <button className="flex items-center gap-2 bg-[#7D0A0A] text-white px-4 py-2 rounded-xl hover:bg-[#5c0707] transition-all shadow-md whitespace-nowrap">
                    <img
                      src="/Images/You&Me.png"
                      alt="You & Him"
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium">You & Him</span>
                  </button>

                  <div className="flex flex-col items-center">
                    <button className="flex items-center justify-center bg-gradient-to-br from-[#2BFF88] to-[#2BD2FF] text-white rounded-full w-10 h-10 md:w-12 md:h-12 transition-all shadow-lg hover:scale-105">
                      <Check className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <span className="text-sm font-medium mt-1 text-gray-700">
                      Accept
                    </span>
                  </div>

                </div>

              </div>
            </div>

            {/* ───────── MOBILE ACTION BUTTONS ───────── */}
            <div className="lg:hidden flex gap-3 mb-6 items-center flex-wrap">

              <button className="flex-1 flex items-center justify-center gap-2 bg-[#7D0A0A] text-white px-3 py-3 rounded-xl text-xs sm:text-sm font-medium shadow-md hover:bg-[#5c0707] transition-all whitespace-nowrap">
                <img
                  src="/Images/You&Me.png"
                  alt="You & Him"
                  className="w-5 h-5"
                />
                You & Him
              </button>

              <button
                onClick={() => setAstroOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#7D0A0A] text-white px-3 py-3 rounded-xl text-xs sm:text-sm font-medium shadow-md hover:bg-[#5c0707] transition-all whitespace-nowrap"
              >
                <img src="/Images/Astro.png" alt="Astro" className="w-5 h-5" />
                Astro
              </button>

              <div className="flex flex-col items-center">
                <button className="flex items-center justify-center bg-gradient-to-br from-[#2BFF88] to-[#2BD2FF] text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 shadow-lg hover:scale-105 transition-transform">
                  <Check className="w-6 h-6" />
                </button>
                <span className="text-xs sm:text-sm font-medium mt-1 text-gray-700">
                  Accept
                </span>
              </div>

            </div>

            {/* ───────── PERSONAL DETAILS ───────── */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                Personal Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personalDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg break-words"
                  >
                    <div className="text-purple-600 flex-shrink-0">
                      {detail.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600">{detail.label}</p>
                      <p className="font-medium text-gray-800 break-words">
                        {detail.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* ───────── FAMILY INFORMATION ───────── */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                Family Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg break-words">
                  <div className="text-purple-600 flex-shrink-0">
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Family Status</p>
                    <p className="font-medium text-gray-800 break-words">
                      {profileData?.familyStatus || "Not Specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg break-words">
                  <div className="text-purple-600 flex-shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Family Type</p>
                    <p className="font-medium text-gray-800 break-words">
                      {profileData?.familyType || "Not Specified"}
                    </p>
                  </div>
                </div>

              </div>
            </div>


            {/* ───────── ABOUT MYSELF ───────── */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                About Myself
              </h2>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed break-words">
                  {profileData?.aboutYourself || "No description available."}
                </p>
              </div>
            </div>


            {/* ───────── HOROSCOPE SECTION ───────── */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                Horoscope
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                {/* DOB */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg break-words">
                  <div className="text-purple-600 flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium text-gray-800 break-words">
                      {profileData?.dateOfBirth || "Not Specified"}
                    </p>
                  </div>
                </div>

                {/* TOB */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg break-words">
                  <div className="text-purple-600 flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Time of Birth</p>
                    <p className="font-medium text-gray-800 break-words">
                      {profileData?.timeOfBirth || "Not Specified"}
                    </p>
                  </div>
                </div>

                {/* Rashi */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg break-words">
                  <div className="text-purple-600 flex-shrink-0">
                    <Star className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Zodiac (Rashi)</p>
                    <p className="font-medium text-gray-800 break-words">
                      {profileData?.horoscope?.rashi || "Not Specified"}
                    </p>
                  </div>
                </div>

                {/* Nakshatra */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg break-words">
                  <div className="text-purple-600 flex-shrink-0">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Nakshatra</p>
                    <p className="font-medium text-gray-800 break-words">
                      {profileData?.horoscope?.nakshatra || "Not Specified"}
                    </p>
                  </div>
                </div>

              </div>

              {/* NOTE BOX */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
                <p className="text-emerald-700 text-sm break-words">
                  <strong>Note:</strong>{" "}
                  {profileData?.horoscope?.matchRequired ||
                    "Horoscope match information not available"}
                </p>
              </div>

            </div>

          </div> {/* RIGHT COLUMN END */}
        </div> {/* MAIN FLEX END */}
      </div> {/* CONTAINER END */}
    </div> /* PAGE END */
  );
}

export default ProfilePage;
