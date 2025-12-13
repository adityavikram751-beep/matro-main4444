'use client';

import { useUser } from './ui/UserContext';
import React, { useState, useEffect } from 'react';
import { FaHeart, FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import SignupWrapper from './signup/SignupWrapper';
import Level1 from './login/Level1';
import { PROFILE } from '@/utils/Api';
import Link from 'next/link';
import MultiStepForm from './steps/MultiStepForm';
import { normalizeImage } from "@/utils/normalizeImage";

const DEFAULT_PROFILE_IMAGE =
  "https://res.cloudinary.com/doexczvsl/image/upload/v1763623358/banners/vel1eszmlyrzpbvsem4u.jpg";

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Matches', href: '/matches' },
  { name: 'Messages', href: '/messages' },
  { name: 'Requests', href: '/requests' },
];

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [profileStep, setProfileStep] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userFirstName, setUserFirstName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { profileImage, setProfileImage } = useUser();
  const [isMultiStepOpen, setIsMultiStepOpen] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayImage, setDisplayImage] = useState<string>(DEFAULT_PROFILE_IMAGE);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false); // New state for mobile profile

  // Sync display image with profileImage from context
  useEffect(() => {
    const normalized = normalizeImage(profileImage);
    if (normalized && normalized !== DEFAULT_PROFILE_IMAGE) {
      console.log('Navbar: Setting display image:', normalized);
      setDisplayImage(normalized);
    } else {
      // Try to get from localStorage as fallback
      const storedImage = localStorage.getItem('profileImage');
      if (storedImage && storedImage !== DEFAULT_PROFILE_IMAGE) {
        const normalizedStored = normalizeImage(storedImage);
        console.log('Navbar: Using stored image:', normalizedStored);
        setDisplayImage(normalizedStored || DEFAULT_PROFILE_IMAGE);
      } else {
        setDisplayImage(DEFAULT_PROFILE_IMAGE);
      }
    }
  }, [profileImage]);

  // Listen for profile image updates from ProfilePage
  useEffect(() => {
    const handleProfileImageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newImage = customEvent.detail?.profileImage;
      if (newImage) {
        console.log('Navbar: Received image update event:', newImage);
        setProfileImage(newImage);
        setDisplayImage(newImage);
      }
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);

    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, [setProfileImage]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      console.log('Navbar: Fetching user profile...');

      const res = await fetch('https://matrimonial-backend-7ahc.onrender.com/api/profile/self', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch user data', res.status);
        return;
      }

      const data = await res.json();
      console.log('Navbar: Received user data:', data);
      
      const user = data.data || data.user || data;

      // Normalize profile image with detailed logging
      let normalizedImage = DEFAULT_PROFILE_IMAGE;
      
      console.log('Navbar: Raw profileImage from API:', user.profileImage);
      
      if (user.profileImage) {
        const normalized = normalizeImage(user.profileImage);
        console.log('Navbar: Normalized image:', normalized);
        
        if (normalized && normalized !== DEFAULT_PROFILE_IMAGE) {
          normalizedImage = normalized;
        }
      }

      // Update all storage locations
      console.log('Navbar: Setting profile image to:', normalizedImage);
      setProfileImage(normalizedImage);
      setDisplayImage(normalizedImage);
      localStorage.setItem("profileImage", normalizedImage);

      const dataToStore = {
        ...user,
        isProfileComplete: data.isProfileComplete,
        profileImage: normalizedImage
      };

      localStorage.setItem('userData', JSON.stringify(dataToStore));
      setProfileComplete(data.isProfileComplete === true);

      console.log('Navbar: Profile data updated successfully');
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isProfileOpen &&
        !(e.target as HTMLElement).closest(".profile-dropdown")
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        const isComplete = parsed.isProfileComplete === true || parsed.isProfileComplete === 'true';
        setProfileComplete(isComplete);
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (token) {
      setIsAuthenticated(true);

      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);

          const firstName =
            parsedData.basicInfo?.firstName ||
            parsedData.firstName ||
            parsedData.user?.firstName ||
            '';
          setUserFirstName(firstName);

          // Get stored image and normalize it
          const storedImage =
            parsedData.profileImage ||
            parsedData.basicInfo?.profileImage ||
            parsedData.user?.profileImage;

          console.log('Navbar init: Found stored image:', storedImage);

          if (storedImage) {
            const normalized = normalizeImage(storedImage);
            console.log('Navbar init: Normalized to:', normalized);
            if (normalized && normalized !== DEFAULT_PROFILE_IMAGE) {
              setProfileImage(normalized);
              setDisplayImage(normalized);
            } else {
              setProfileImage(DEFAULT_PROFILE_IMAGE);
              setDisplayImage(DEFAULT_PROFILE_IMAGE);
            }
          } else {
            setProfileImage(DEFAULT_PROFILE_IMAGE);
            setDisplayImage(DEFAULT_PROFILE_IMAGE);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      // Fetch fresh data from server
      fetchUser();
    }
  }, [setProfileImage]);

  const handleLoginSuccess = async (token: string, userId: string) => {
    localStorage.setItem('authToken', token);
    try {
      const response = await fetch(`${PROFILE.GET_USER_DATA}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Normalize profile image before storing
        let normalizedImage = DEFAULT_PROFILE_IMAGE;
        if (userData.profileImage) {
          normalizedImage = normalizeImage(userData.profileImage) || DEFAULT_PROFILE_IMAGE;
        }

        const dataToStore = {
          ...userData,
          profileImage: normalizedImage
        };

        localStorage.setItem('userData', JSON.stringify(dataToStore));
        setProfileImage(normalizedImage);

        const firstName =
          userData.firstName ||
          userData.basicInfo?.firstName ||
          userData.user?.firstName ||
          '';

        setUserFirstName(firstName);

        if (userData.profileComplete === false) {
          setTimeout(() => {
            setIsProfileSetupOpen(true);
          }, 3000);
        }
      } else {
        console.error('Failed to fetch user data:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    setIsAuthenticated(true);
    setIsLoginOpen(false);
    setCurrentLevel(1);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('profileImage');
    setIsAuthenticated(false);
    setIsProfileOpen(false);
    setUserFirstName('');
    setIsProfileSetupOpen(false);
    setProfileStep(1);
    setProfileImage(DEFAULT_PROFILE_IMAGE);
    setDisplayImage(DEFAULT_PROFILE_IMAGE);
    setMobileOpen(false);
    setIsMobileProfileOpen(false);
    router.push('/');
  };

  const handleProfileUpdateSuccess = (profileData: any) => {
    const normalizedImage = normalizeImage(profileData.profileImage) || DEFAULT_PROFILE_IMAGE;
    const updatedUserData = { 
      ...profileData.user, 
      isProfileComplete: profileData.isProfileComplete,
      profileImage: normalizedImage
    };
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    localStorage.setItem('profileImage', normalizedImage);
    setProfileComplete(profileData.isProfileComplete);
    setProfileImage(normalizedImage);
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
    setCurrentLevel(1);
  };

  const openSignupModal = () => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
  };

  const handleContinueLevel1 = () => setCurrentLevel(2);
  const handleBackLevel1 = () => setCurrentLevel(1);

  const handleBack = () => {
    if (profileStep > 1) {
      setProfileStep(profileStep - 1);
      setErrorMessage('');
    } else {
      setIsProfileSetupOpen(false);
    }
  };

  const handleUpdateProfile = () => {
    setIsProfileOpen(false);
    setIsMultiStepOpen(true);
    setMobileOpen(false);
    setIsMobileProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFF8F0] shadow">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <div className="flex items-center space-x-2">
          <FaHeart className="text-red-500 text-2xl" />
          <span className="font-bold text-xl">Logo</span>
        </div>

        {isAuthenticated && (
          <ul className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-gray-700 hover:text-[#7D0A0A] transition-colors duration-200 font-medium"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="hidden md:flex items-center">
          {!isAuthenticated ? (
            <button
              type="button"
              className="bg-[#7D0A0A] text-white px-7 py-3 rounded text-md font-semibold font-Mulish shadow-md hover:bg-[#5A0707] transition-colors duration-200"
              style={{ letterSpacing: '1px', height: '48px' }}
              onClick={openLoginModal}
            >
              Login
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {displayImage && displayImage !== DEFAULT_PROFILE_IMAGE ? (
                    <img
                      key={displayImage}
                      src={displayImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Navbar: Image load failed for:', displayImage);
                        e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                      }}
                      onLoad={() => {
                        console.log('Navbar: Image loaded successfully:', displayImage);
                      }}
                    />
                  ) : (
                    <FaUserCircle className="text-3xl text-gray-600" />
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <span className="font-medium text-gray-800">
                    {userFirstName || 'Profile'}
                  </span>
                  <FaChevronDown
                    className={`text-gray-600 transition-transform ${isProfileOpen ? 'transform rotate-180' : ''}`}
                  />
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 profile-dropdown">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <p className="font-medium">{userFirstName || 'User'}</p>
                    <Link href="/profiles">
                      <p className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">View Profile</p>
                    </Link>
                  </div>

                  {!profileComplete ? (
                    <button
                      onClick={handleUpdateProfile}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Complete Profile
                    </button>
                  ) : (
                    <>
                      <Link href="./profiles/Wishlist">
                        <button 
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Wishlist
                        </button>
                      </Link>

                      <Link href="/profiles/not-now">
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Not Now
                        </button>
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <FaSignOutAlt />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isMultiStepOpen && (
          <MultiStepForm
            onClose={() => setIsMultiStepOpen(false)}
            onSuccess={(profileData) => {
              handleProfileUpdateSuccess(profileData);
            }}
          />
        )}

        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <FaTimes className="text-2xl text-gray-700" />
          ) : (
            <FaBars className="text-2xl text-gray-700" />
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden bg-white shadow px-4 pb-4 animate-fade-in-down">
          {/* Mobile Navigation Links */}
          {isAuthenticated && (
            <ul className="flex flex-col space-y-3 mt-2 mb-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="block text-gray-700 hover:text-red-500 transition-colors duration-200 font-medium py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {/* Mobile Profile Section */}
          {isAuthenticated ? (
            <div className="border-t border-gray-200 pt-4 mt-4">
              {/* Profile Header */}
              <div 
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {displayImage && displayImage !== DEFAULT_PROFILE_IMAGE ? (
                    <img
                      src={displayImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                      }}
                    />
                  ) : (
                    <FaUserCircle className="text-3xl text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{userFirstName || 'Profile'}</p>
                  <p className="text-xs text-gray-500">Click to view options</p>
                </div>
                <FaChevronDown
                  className={`text-gray-600 transition-transform ${isMobileProfileOpen ? 'transform rotate-180' : ''}`}
                />
              </div>

              {/* Mobile Profile Dropdown */}
              {isMobileProfileOpen && (
                <div className="mt-2 ml-4 border-l-2 border-gray-200 pl-4 space-y-2">
                  <Link href="/profiles">
                    <div 
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                      onClick={() => setMobileOpen(false)}
                    >
                      <FaUserCircle className="text-gray-600" />
                      <span className="text-gray-700">View Profile</span>
                    </div>
                  </Link>

                  {!profileComplete ? (
                    <div 
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                      onClick={handleUpdateProfile}
                    >
                      <span className="text-gray-700">Complete Profile</span>
                    </div>
                  ) : (
                    <>
                      <Link href="./profiles/Wishlist">
                        <div 
                          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="text-gray-700">Wishlist</span>
                        </div>
                      </Link>

                      <Link href="/profiles/not-now">
                        <div 
                          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="text-gray-700">Not Now</span>
                        </div>
                      </Link>
                    </>
                  )}

                  <div 
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer text-red-600"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                    <span>Sign out</span>
                  </div>
                </div>
              )}

              {/* Logout Button (Always Visible) */}
              <button
                className="mt-4 w-full bg-red-500 text-white px-5 py-3 rounded font-semibold hover:bg-red-600 transition-colors duration-200"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            /* Login Button for Non-Authenticated Users */
            <div className="mt-4">
              <button
                className="w-full bg-[#7D0A0A] text-white px-5 py-3 rounded font-semibold hover:bg-[#5A0707] transition-colors duration-200"
                onClick={() => {
                  setMobileOpen(false);
                  openLoginModal();
                }}
              >
                Login
              </button>
            </div>
          )}
        </div>
      )}

      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-red-500"
              onClick={() => setIsLoginOpen(false)}
            >
              ✕
            </button>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            {currentLevel === 1 && (
              <Level1
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                onBack={handleBackLevel1}
                handleContinueLevel1={handleContinueLevel1}
                openSignupModal={openSignupModal}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </div>
        </div>
      )}

      {isSignupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-red-500"
              onClick={() => setIsSignupOpen(false)}
            >
              ✕
            </button>

            <SignupWrapper
              onSignupSuccess={(token, userData) => {
                handleLoginSuccess(token, userData?.id || '');
                setIsMultiStepOpen(true);
              }}
              setIsProfileSetupOpen={setIsProfileSetupOpen}
              closeModal={() => setIsSignupOpen(false)}
            />
          </div>
        </div>
      )}

      {isProfileSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40">
          <div className="relative rounded-lg shadow-xl w-full max-w-md mx-auto p-6 animate-fade-in custom-scrollbar bg-white px-4 py-4 min-w-[450px] max-h-[90vh] overflow-y-auto">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setIsProfileSetupOpen(false)}
            >
              ✕
            </button>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}