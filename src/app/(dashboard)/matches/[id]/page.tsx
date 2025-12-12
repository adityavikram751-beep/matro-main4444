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
        setError("Invalid profile ID");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/profile/users/${id}`
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setProfileData(data.profile);
        } else {
          setError("Failed to fetch profile data.");
        }
      } catch (err: any) {
        setError(err.message || "Error while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const personalDetails =
    profileData &&
    [
      { label: "Age", value: profileData.age, icon: <User className="w-4 h-4" /> },
      { label: "Height", value: profileData.height, icon: <User className="w-4 h-4" /> },
      { label: "Spoken Languages", value: profileData.motherTongue, icon: <Users className="w-4 h-4" /> },
      { label: "Profile Created By", value: profileData.profileCreatedBy, icon: <User className="w-4 h-4" /> },
      { label: "Marital Status", value: profileData.maritalStatus, icon: <Heart className="w-4 h-4" /> },
      { label: "Lives In", value: profileData.location, icon: <MapPin className="w-4 h-4" /> },
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
    ];

  if (loading)
    return <div className="min-h-screen flex justify-center items-center text-lg">Loading...</div>;

  if (error)
    return <div className="min-h-screen flex justify-center items-center text-red-600 text-lg">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">

        {/* ⭐ MOBILE HEADER → PERFECT RESPONSIVE */}
        <div className="lg:hidden bg-white rounded-2xl shadow-md p-5 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{profileData?.name}</h1>
            <p className="text-sm text-gray-500">ID: {profileData?.id}</p>
          </div>
          <Image
            src={profileData?.profileImage || fallbackImage}
            alt={profileData?.name || "Profile"}
            width={70}
            height={70}
            className="rounded-full object-cover"
          />
        </div>

        {/* ⭐ 2-COLUMN LAYOUT — FULLY RESPONSIVE */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT  */}
          <div className="lg:w-1/3 space-y-6">

            <div className="hidden lg:block bg-white rounded-2xl shadow-md p-6 text-center">
              <Image
                src={profileData?.profileImage || fallbackImage}
                alt={profileData?.name || "profile"}
                width={180}
                height={180}
                className="rounded-full mx-auto mb-4 object-cover"
              />

              <div className="bg-pink-50 border border-pink-200 p-4 rounded-xl">
                <p className="font-semibold flex items-center justify-center gap-2 text-gray-800">
                  Verified Profile
                  <img src="/Images/blue tick.png" className="w-5 h-5" />
                </p>
                <p className="text-sm text-gray-600 mt-1">Name verified via Govt ID</p>
              </div>
            </div>

          </div>

          {/* RIGHT  */}
          <div className="lg:w-2/3 space-y-6">

            {/* DESKTOP HEADER */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-md p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{profileData?.name}</h1>
                  <p className="text-gray-500">ID: {profileData?.id}</p>

                  <p className="flex items-center gap-1 text-emerald-600 text-sm mt-1">
                    <Clock className="w-4 h-4" />
                    Last seen: {profileData?.lastSeen}
                  </p>
                </div>

                {/* BUTTONS RESPONSIVE */}
                <div className="flex gap-4 items-center flex-wrap">
                  <button className="flex items-center gap-2 bg-[#7D0A0A] px-4 py-2 rounded-xl text-white text-sm shadow-md">
                    <img src="/Images/You&Me.png" className="w-5 h-5" /> You & Him
                  </button>

                  <div className="flex flex-col items-center">
                    <button className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#2BFF88] to-[#2BD2FF] shadow-lg">
                      <Check className="w-6 h-6 text-white" />
                    </button>
                    <span className="text-sm">Accept</span>
                  </div>
                </div>

              </div>
            </div>

            {/* MOBILE BUTTONS RESPONSIVE */}
            <div className="lg:hidden flex gap-3 items-center">
              <button className="flex-1 bg-[#7D0A0A] text-white rounded-xl px-3 py-3 flex items-center justify-center gap-2 shadow-md">
                <img src="/Images/You&Me.png" className="w-5 h-5" /> You & Him
              </button>

              <button
                onClick={() => setAstroOpen(true)}
                className="flex-1 bg-[#7D0A0A] text-white rounded-xl px-3 py-3 flex items-center justify-center gap-2 shadow-md"
              >
                <img src="/Images/Astro.png" className="w-5 h-5" /> Astro
              </button>

              <div className="flex flex-col items-center">
                <button className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#2BFF88] to-[#2BD2FF] shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </button>
                <span className="text-xs mt-1">Accept</span>
              </div>
            </div>

            {/* PERSONAL DETAILS */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personalDetails?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-purple-50"
                  >
                    <div className="text-purple-600">{item.icon}</div>
                    <div>
                      <p className="text-sm text-gray-600">{item.label}</p>
                      <p className="font-medium text-gray-800">{item.value || "Not Available"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAMILY INFO */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-3">Family Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
                  <Home className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Family Status</p>
                    <p className="font-medium">{profileData?.familyStatus || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Family Type</p>
                    <p className="font-medium">{profileData?.familyType || "Not Specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ABOUT */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-3">About Myself</h2>
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-gray-700">{profileData?.aboutYourself || "No description added."}</p>
              </div>
            </div>

            {/* HOROSCOPE */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-3">Horoscope</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{profileData?.dateOfBirth || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Time of Birth</p>
                    <p className="font-medium">{profileData?.timeOfBirth || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Star className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Rashi</p>
                    <p className="font-medium">{profileData?.horoscope?.rashi || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Moon className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Nakshatra</p>
                    <p className="font-medium">{profileData?.horoscope?.nakshatra || "Not Specified"}</p>
                  </div>
                </div>

              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
                <p className="text-emerald-700 text-sm">
                  <strong>Note:</strong>{" "}
                  {profileData?.horoscope?.matchRequired || "Horoscope match requirement not specified"}
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
