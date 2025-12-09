"use client";

import React, { useEffect, useState, useRef } from 'react';
import ProfilePhotoSection from '@/app/(dashboard)/profiles/_components/ProfilePhotoSection';
import StatsSection from '@/app/(dashboard)/profiles/_components/StatsSection';
import ReligiousInfoSection from '@/app/(dashboard)/profiles/_components/ReligiousInfoSection';
import LifestyleInfoSection from '@/app/(dashboard)/profiles/_components/LifestyleInfoSection';
import AboutMeSection from './_components/AboutMeSection';
import EducationSection from './_components/EducationSection';
import CareerSection from './_components/CareerSection';
import AstroDetailsSection from './_components/AstroDetailsSection';
import BasicInfoSection from './_components/BasicInfoSection';
import FamilyInfoSection from './_components/FamilyInfoSection';
import { useUser } from '../../../components/ui/UserContext';

const DEFAULT_PROFILE_IMAGE = "https://res.cloudinary.com/dppe3ni5z/image/upload/v1757144487/default-profile.png";

const API_URL = 'https://matrimonial-backend-7ahc.onrender.com/api/profile/self';
const UPDATE_API_URL = 'https://matrimonial-backend-7ahc.onrender.com/api/profile/update-profile';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [editableProfile, setEditableProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const { profileImage, setProfileImage } = useUser();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean>(false);

  const [displayImage, setDisplayImage] = useState<string | null>(null);

  // ⭐ NEW — Wishlist + Not Now counts
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notNowCount, setNotNowCount] = useState(0);

  const autoSaveProfile = (updatedProfile: any) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch(UPDATE_API_URL, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updatedProfile),
        });

        if (!response.ok) throw new Error('Failed to save');

        const data = await response.json();
        setProfile(data.data || data);
        console.log('Profile auto-saved!');
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 1000);
  };

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        const isComplete = parsed.profileComplete === true || parsed.profileComplete === "true";
        setProfileComplete(isComplete);
      } catch (e) {
        console.error("Error parsing userData:", e);
      }
    }
  }, []);

  // ⭐ Fetch profile details
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found.');

        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();

        const fullProfile = data.data || data;

        if (fullProfile.profileImage) {
          if (typeof fullProfile.profileImage === "object") {
            if (fullProfile.profileImage.filename) {
              fullProfile.profileImage = `https://matrimonial-backend-7ahc.onrender.com/uploads/${fullProfile.profileImage.filename}`;
            } else if (fullProfile.profileImage.url) {
              fullProfile.profileImage = `https://matrimonial-backend-7ahc.onrender.com${fullProfile.profileImage.url}`;
            }
          }
        }

        setProfile(fullProfile);
        setEditableProfile(fullProfile);

        const imageUrl = fullProfile.profileImage || DEFAULT_PROFILE_IMAGE;
        setDisplayImage(imageUrl);
        setProfileImage(imageUrl);
        localStorage.setItem("profileImage", imageUrl);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setProfileImage]);

  // ⭐ NEW — Fetch Wishlist + Not Now counts
  useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        // Wishlist
        const res1 = await fetch(
          "https://matrimonial-backend-7ahc.onrender.com/api/like/ShortlistCount",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data1 = await res1.json();
        if (data1.success) setWishlistCount(data1.count);

        // Not Now
        const res2 = await fetch(
          "https://matrimonial-backend-7ahc.onrender.com/api/cross/BlockedCount",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data2 = await res2.json();
        if (data2.success) setNotNowCount(data2.count);

      } catch (err) {
        console.error("Count fetch error:", err);
      }
    };

    fetchCounts();
  }, []);

  // ⭐ NEW — Stat mapping
  const mapStats = () => [
    { number: wishlistCount.toString(), label: 'Wishlist', color: 'bg-yellow-50 text-yellow-600' },
    { number: notNowCount.toString(), label: 'Not-Now', color: 'bg-pink-50 text-pink-600' },
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUpdateStatus('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUpdateStatus('Image size should be less than 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setDisplayImage(previewUrl);

    setPhotoUploading(true);
    setUpdateStatus(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/basic-details", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid server response');
      }

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Upload failed');

      let uploadedUrl = data.data?.profileImage || data.profileImage;

      if (typeof uploadedUrl === "object") {
        if (uploadedUrl.filename) {
          uploadedUrl = `https://matrimonial-backend-7ahc.onrender.com/uploads/${uploadedUrl.filename}`;
        } else if (uploadedUrl.url) {
          uploadedUrl = `https://matrimonial-backend-7ahc.onrender.com${uploadedUrl.url}`;
        }
      }

      URL.revokeObjectURL(previewUrl);

      setDisplayImage(uploadedUrl);
      setProfileImage(uploadedUrl);
      localStorage.setItem("profileImage", uploadedUrl);

      setProfile((prev: any) => ({ ...prev, profileImage: uploadedUrl }));
      setEditableProfile((prev: any) => ({ ...prev, profileImage: uploadedUrl }));

      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          parsed.profileImage = uploadedUrl;
          if (parsed.basicInfo) parsed.basicInfo.profileImage = uploadedUrl;
          localStorage.setItem('userData', JSON.stringify(parsed));
        } catch { }
      }

      window.dispatchEvent(new CustomEvent('profileImageUpdated', {
        detail: { profileImage: uploadedUrl }
      }));

      setUpdateStatus("Profile photo updated successfully!");
      setTimeout(() => setUpdateStatus(null), 3000);

    } catch (err: any) {
      console.error("Upload error:", err);
      setUpdateStatus(err.message || "Failed to upload photo");
      setDisplayImage(profile?.profileImage || DEFAULT_PROFILE_IMAGE);
      URL.revokeObjectURL(previewUrl);
    } finally {
      setPhotoUploading(false);
    }
  };

  const normalizeEnum = (value: any) => {
    if (value === true || value === "true" || value === "Yes") return "Yes";
    return "No";
  };

  const mapBasicInfo = (p: any) => [
    { label: 'Posted by', value: p?.basicInfo?.postedBy || 'Self' },
    { label: 'Name', value: `${p?.basicInfo?.firstName || ''} ${p?.basicInfo?.middleName !== 'None' ? p?.basicInfo?.middleName : ''} ${p?.basicInfo?.lastName || ''}`.replace(/ +/g, ' ').trim() },
    { label: 'Age', value: p?.basicInfo?.age || '' },
    { label: 'Marital Status', value: p?.basicInfo?.maritalStatus || '' },
    { label: 'Height', value: p?.basicInfo?.height || '' },
    { label: 'Any Disability', value: p?.basicInfo?.anyDisability || 'None' },
    { label: 'Health Information', value: p?.basicInfo?.healthInformation || 'Not Specified' },
    { label: 'Weight', value: p?.basicInfo?.weight?.toString() || '' },
    { label: 'Complexion', value: p?.basicInfo?.complexion || '' },
  ];

  const mapReligiousInfo = (p: any) => [
    { label: 'Religion', value: p?.religionDetails?.religion || '' },
    { label: 'Mother Tongue', value: p?.religionDetails?.motherTongue || '' },
    { label: 'Community', value: p?.religionDetails?.community || '' },
    { label: 'Caste No Bar', value: p?.religionDetails?.casteNoBar || '' },
    { label: 'Gotra/Gothra', value: p?.religionDetails?.gothra || '' },
  ];

  const mapFamilyInfo = (p: any) => [
    { label: 'Family Background', value: p?.familyDetails?.familyBackground || '' },
    { label: 'Father is', value: p?.familyDetails?.fatherOccupation || '' },
    { label: 'Mother is', value: p?.familyDetails?.motherOccupation || '' },
    { label: 'Brother', value: p?.familyDetails?.brother?.toString() || '' },
    { label: 'Sister', value: p?.familyDetails?.sister?.toString() || '' },
    { label: 'Family Based Out of', value: p?.familyDetails?.familyBasedOutOf || '' },
  ];

  const mapLifestyleInfo = (p: any) => [
    {
      label: 'Habits', items: [
        `Diet - ${p?.lifestyleHobbies?.diet || ''}`,
        `Drinking - ${normalizeEnum(p?.lifestyleHobbies?.drinking)}`,
        `Smoking - ${normalizeEnum(p?.lifestyleHobbies?.smoking)}`,
        `Open to pets - ${p?.lifestyleHobbies?.openToPets || ''}`,
      ]
    },
    {
      label: 'Assets', items: [
        `Own a House - ${p?.lifestyleHobbies?.ownHouse || ''}`,
        `Own a Car - ${p?.lifestyleHobbies?.ownCar || ''}`,
      ]
    },
    { label: 'Food I cook', items: p?.lifestyleHobbies?.foodICook || [] },
    { label: 'Hobbies', items: p?.lifestyleHobbies?.hobbies || [] },
    { label: 'Interests', items: p?.lifestyleHobbies?.interests || [] },
    { label: 'Favorite Music', items: p?.lifestyleHobbies?.favoriteMusic || [] },
    { label: 'Sports', items: p?.lifestyleHobbies?.sports || [] },
    { label: 'Cuisine', items: p?.lifestyleHobbies?.cuisine || [] },
    { label: 'Movies', items: p?.lifestyleHobbies?.movies || [] },
    { label: 'TV Shows', items: p?.lifestyleHobbies?.tvShows || [] },
    { label: 'Vacation Destination', items: p?.lifestyleHobbies?.vacationDestination || [] },
  ];

  const mapAstroDetails = (p: any) => [
    { label: 'Zodiac', value: p?.astroDetails?.zodiacSign || '' },
    { label: 'Date of Birth', value: p?.astroDetails?.dateOfBirth || '' },
    { label: 'Time of Birth', value: p?.astroDetails?.timeOfBirth || '' },
    { label: 'City of Birth', value: p?.astroDetails?.cityOfBirth || '' },
    { label: 'Manglik', value: normalizeEnum(p?.astroDetails?.manglik) },
  ];

  const mapEducation = (p: any) => [
    { label: 'Highest Degree', value: p?.educationDetails?.highestDegree || '' },
    { label: 'Post Graduation', value: p?.educationDetails?.postGraduation || '' },
    { label: 'Under Graduation', value: p?.educationDetails?.underGraduation || '' },
    { label: 'School', value: p?.educationDetails?.school || '' },
    { label: 'School Stream', value: p?.educationDetails?.schoolStream || '' },
  ];

  const mapCareer = (p: any) => [
    { label: 'Employee In', value: p?.careerDetails?.employedIn || '' },
    { label: 'Occupation', value: p?.careerDetails?.occupation || '' },
    { label: 'Company', value: p?.careerDetails?.company || '' },
    { label: 'Annual Income', value: p?.careerDetails?.annualIncome || '' },
  ];

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-white flex items-center justify-center">No profile data found.</div>;
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4"></div>

        {updateStatus && (
          <div className={`mb-4 p-2 rounded ${updateStatus.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {updateStatus}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white">
          <div className="lg:col-span-1 space-y-6">
            <ProfilePhotoSection
              imageUrl={displayImage}
              photoUploading={photoUploading}
              onPhotoChange={handlePhotoUpload}
            />

            <AboutMeSection aboutMe={profile?.aboutMe} />
            <EducationSection education={mapEducation(profile)} />
            <CareerSection career={mapCareer(profile)} />
            <AstroDetailsSection astroDetails={mapAstroDetails(profile)} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* ⭐ Stats now shows LIVE API values */}
            <StatsSection stats={mapStats()} />

            <BasicInfoSection basicInfo={mapBasicInfo(profile)} />
            <ReligiousInfoSection religiousInfo={mapReligiousInfo(profile)} />
            <FamilyInfoSection familyInfo={mapFamilyInfo(profile)} />
            <LifestyleInfoSection lifestyleInfo={mapLifestyleInfo(profile)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
