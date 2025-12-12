"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Check, Heart, Star, MapPin, Clock, User, Home, Briefcase, GraduationCap, Users, Calendar, Moon } from "lucide-react";
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
  const fallbackImage = "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://matrimonial-backend-7ahc.onrender.com/api/profile/users/${id}`);
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
        { label: "Age", value: profileData.age, icon: <User className="w-4 h-4" /> },
        { label: "Height", value: profileData.height, icon: <User className="w-4 h-4" /> },
        { label: "Spoken Languages", value: profileData.motherTongue, icon: <Users className="w-4 h-4" /> },
        { label: "Profile Created By", value: profileData.profileCreatedBy, icon: <User className="w-4 h-4" /> },
        { label: "Marital Status", value: profileData.maritalStatus, icon: <Heart className="w-4 h-4" /> },
        { label: "Lives In", value: profileData.location || "Not Specified", icon: <MapPin className="w-4 h-4" /> },
        { label: "Eating Habits", value: profileData.eatingHabits, icon: <Users className="w-4 h-4" /> },
        { label: "Religion", value: profileData.religion, icon: <Star className="w-4 h-4" /> },
        { label: "Gothra", value: profileData.gotra, icon: <Star className="w-4 h-4" /> },
        { label: "Dosha", value: profileData.horoscope?.manglik === "false" ? "No Dosha" : "Manglik", icon: <Moon className="w-4 h-4" /> },
        { label: "Employment", value: profileData.employedIn, icon: <Briefcase className="w-4 h-4" /> },
        { label: "Annual Income", value: profileData.annualIncome, icon: <Briefcase className="w-4 h-4" /> },
        { label: "Education", value: profileData.education, icon: <GraduationCap className="w-4 h-4" /> },
        { label: "Occupation", value: profileData.designation, icon: <Briefcase className="w-4 h-4" /> },
      ]
    : [];

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-white font-['Inter',system-ui,sans-serif] overflow-x-hidden">

      <div className="max-w-7xl mx-auto px-4 py-8 w-full">

        {/* MOBILE HEADER */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg p-6 mb-6 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="break-words max-w-[60%]">
              <h1 className="text-2xl font-bold text-gray-800 break-words">{profileData?.name || "User"}</h1>
              <p className="text-sm text-gray-500 break-words">ID: {profileData?.id || "N/A"}</p>
            </div>

            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
              <Image
                src={profileData?.profileImage || fallbackImage}
                alt={profileData?.name || "Profile"}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* RESPONSIVE WRAPPER */}
        <div className="flex flex-col lg:flex-row gap-8 w-full">

          {/* LEFT COLUMN */}
          <div className="lg:w-1/3 w-full space-y-6">

            <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-6 w-full">
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <Image
                    src={profileData?.profileImage || fallbackImage}
                    alt={profileData?.name || "Profile"}
                    width={192}
                    height={192}
                    className="object-cover w-full h-full rounded-full border-4"
                  />
                </div>

                <div className="bg-[#FFEDFA] border rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-black">
                    <span className="font-semibold">Verified Profile</span>
                    <img src="/Images/blue tick.png" alt="blue tick" className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-black mt-1">Name verified against Govt ID</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:w-2/3 w-full space-y-6">

            {/* DESKTOP HEADER */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-6 w-full">
              <div className="flex items-center justify-between mb-4 flex-wrap">
                <div className="break-words max-w-[60%]">
                  <h1 className="text-3xl font-bold text-gray-800 break-words">{profileData?.name || "User"}</h1>
                  <p className="text-gray-500 break-words">ID: {profileData?.id || "N/A"}</p>
                  <p className="text-emerald-600 flex items-center gap-1 mt-1 break-words">
                    <Clock className="w-4 h-4" />
                    Last seen: {profileData?.lastSeen || "N/A"}
                  </p>
                </div>

                <div className="flex gap-4 items-center flex-wrap">
                  <button className="flex items-center gap-2 bg-[#7D0A0A] text-white px-4 py-2 rounded-xl hover:bg-[#5c0707] transition-all shadow-md">
                    <img src="/Images/You&Me.png" className="w-5 h-5" />
                    <span className="text-sm font-medium">You & Him</span>
                  </button>

                  <div className="flex flex-col items-center">
                    <button className="flex items-center justify-center bg-gradient-to-br from-[#2BFF88] to-[#2BD2FF] text-white rounded-full w-12 h-12 hover:scale-105 transition">
                      <Check className="w-6 h-6" />
                    </button>
                    <span className="text-sm font-medium mt-1 text-gray-700">Accept</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE BUTTONS */}
            <div className="lg:hidden flex gap-3 mb-6 w-full">
              <button className="flex-1 flex items-center justify-center gap-2 bg-[#7D0A0A] text-white rounded-xl text-sm py-3 shadow-md">
                <img src="/Images/You&Me.png" className="w-5 h-5" />
                You & Him
              </button>

              <button onClick={() => setAstroOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-[#7D0A0A] text-white rounded-xl text-sm py-3 shadow-md">
                <img src="/Images/Astro.png" className="w-5 h-5" />
                Astro
              </button>

              <div className="flex flex-col items-center">
                <button className="bg-gradient-to-br from-[#2BFF88] to-[#2BD2FF] w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:scale-105 transition">
                  <Check className="w-6 h-6" />
                </button>
                <span className="text-xs mt-1 text-gray-700">Accept</span>
              </div>
            </div>

            {/* PERSONAL DETAILS */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personalDetails.map((detail, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                    <div className="text-purple-600">{detail.icon}</div>
                    <div className="break-words">
                      <p className="text-sm text-gray-600">{detail.label}</p>
                      <p className="font-medium text-gray-800 break-words">{detail.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAMILY INFORMATION */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Family Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                  <Home className="text-purple-600 w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-600">Family Status</p>
                    <p className="font-medium text-gray-800">{profileData?.familyStatus || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                  <Users className="text-purple-600 w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-600">Family Type</p>
                    <p className="font-medium text-gray-800">{profileData?.familyType || "Not Specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ABOUT MYSELF */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">About Myself</h2>
              <div className="rounded-lg p-4 bg-purple-50">
                <p className="text-gray-700 leading-relaxed break-words">{profileData?.aboutYourself || "No description available."}</p>
              </div>
            </div>

            {/* HOROSCOPE */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Horoscope</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                  <Calendar className="text-purple-600 w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium text-gray-800">{profileData?.dateOfBirth || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                  <Clock className="text-purple-600 w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-600">Time of Birth</p>
                    <p className="font-medium text-gray-800">{profileData?.timeOfBirth || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                  <Star className="text-purple-600 w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-600">Zodiac (Rashi)</p>
                    <p className="font-medium text-gray-800">{profileData?.horoscope?.rashi || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                  <Moon className="text-purple-600 w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-600">Nakshatra</p>
                    <p className="font-medium text-gray-800">{profileData?.horoscope?.nakshatra || "Not Specified"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-200">
                <p className="text-emerald-700 text-sm break-words">
                  <strong>Note:</strong> {profileData?.horoscope?.matchRequired || "Horoscope match information not available"}
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
