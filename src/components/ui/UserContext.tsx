'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ProfileImageType = string | null;

interface UserContextType {
  profileImage: ProfileImageType;
  setProfileImage: (image: ProfileImageType) => void;
}

const UserContext = createContext<UserContextType>({
  profileImage: null,
  setProfileImage: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profileImage, setProfileImage] = useState<ProfileImageType>(null);

  // 🔥 Load stored image when app starts (safe for SSR)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedImage = localStorage.getItem("profileImage");
      if (storedImage) {
        setProfileImage(storedImage);
      }
    }
  }, []);

  // 🔥 Store the image in localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
  }, [profileImage]);

  return (
    <UserContext.Provider value={{ profileImage, setProfileImage }}>
      <div className="w-full max-w-[100%] sm:max-w-[95%] mx-auto">
        {children}
      </div>
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
