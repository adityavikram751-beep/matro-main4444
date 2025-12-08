'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload,X } from 'lucide-react';

interface Step7Props {
  profileImage: File | string | null;
  setProfileImage: (file: File | string | null) => void;
  adhaarCardFrontImage: File | null;
  setAdhaarCardFrontImage: (file: File | null) => void;
  adhaarCardBackImage: File | null;
  setAdhaarCardBackImage: (file: File | null) => void;
  onBack: () => void;
  handleContinue: () => void;   // ✅ use same as other steps
    onClose: () => void; // ✅ Add onClose

  errorMessage?: string;
  isSubmitting?: boolean;
}

const Step7Form: React.FC<Step7Props> = ({
  profileImage,
  setProfileImage,
  adhaarCardFrontImage,
  setAdhaarCardFrontImage,
  adhaarCardBackImage,
  setAdhaarCardBackImage,
  onBack,
  handleContinue,
    onClose, // ✅ receive onClose

  errorMessage,
  isSubmitting = false,
}) => {
  return (
        <div className="relative">
      {/* Cross button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 transition"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex items-center space-x-3 mb-6">
        <button type="button" onClick={onBack}>
          <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-rose-600 transition-colors" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          Aadhaar & Photo Verification
        </h2>
      </div>

      {/* Profile Image */}
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Profile Image *
        </Label>
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files && setProfileImage(e.target.files[0])
            }
            className="w-full bg-white"
          />
          <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        {profileImage && typeof profileImage !== 'string' && (
          <p className="text-sm mt-1">{profileImage.name}</p>
        )}
      </div>

      {/* Aadhaar Front */}
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Aadhaar Front *
        </Label>
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files && setAdhaarCardFrontImage(e.target.files[0])
            }
            className="w-full bg-white"
          />
          <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        {adhaarCardFrontImage && (
          <p className="text-sm mt-1">{adhaarCardFrontImage.name}</p>
        )}
      </div>

      {/* Aadhaar Back */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Aadhaar Back *
        </Label>
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files && setAdhaarCardBackImage(e.target.files[0])
            }
            className="w-full bg-white"
          />
          <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        {adhaarCardBackImage && (
          <p className="text-sm mt-1">{adhaarCardBackImage.name}</p>
        )}
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
      )}

      <Button
        onClick={handleContinue}
        disabled={isSubmitting}
        className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 font-medium"
      >
        {isSubmitting ? 'Submitting...' : 'Continue'}
      </Button>
    </div>
  );
};

export default Step7Form;
