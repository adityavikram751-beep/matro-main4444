"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { normalizeImage } from "../../../../utils/normalizeImage";

interface ProfilePhotoSectionProps {
  imageUrl?: any;
  onPhotoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  photoUploading?: boolean;
}

const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({
  imageUrl,
  onPhotoChange,
  photoUploading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [isBlob, setIsBlob] = useState(false);

  useEffect(() => {
    const normalized = normalizeImage(imageUrl);
    setFinalUrl(normalized);
    // Check if the URL is a blob URL
    setIsBlob(normalized?.startsWith('blob:') || false);
  }, [imageUrl]);

  const handleButtonClick = () => {
    if (!photoUploading) fileInputRef.current?.click();
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-5 flex flex-col items-center">
      <div className="w-48 h-48 rounded-full overflow-hidden shadow-md relative mb-4 bg-gray-200">
        {finalUrl && (
          <>
            {isBlob ? (
              // Use regular img tag for blob URLs
              <img
                key={finalUrl}
                src={finalUrl}
                alt="Profile Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              // Use Next.js Image component for regular URLs
              <Image
                key={finalUrl}
                src={finalUrl}
                alt="Profile Photo"
                fill
                className="object-cover"
                sizes="200px"
                unoptimized={isBlob}
              />
            )}
          </>
        )}
      </div>

      {onPhotoChange && (
        <>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={onPhotoChange}
            disabled={photoUploading}
          />

          <button
            onClick={handleButtonClick}
            disabled={photoUploading}
            className={`px-5 py-2 text-white text-sm rounded-full transition-all ${
              photoUploading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {photoUploading ? "Uploading..." : "Add photos"}
          </button>
        </>
      )}
    </div>
  );
};

export default ProfilePhotoSection;