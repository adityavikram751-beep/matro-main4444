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

  // 🔥 Load image from localStorage once when app loads
  useEffect(() => {
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setProfileImage(storedImage);
    }
  }, []);

  // 🔥 Whenever profileImage changes, store it globally
  useEffect(() => {
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
  }, [profileImage]);

  return (
    <UserContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
