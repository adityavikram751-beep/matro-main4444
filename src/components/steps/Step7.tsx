'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, X } from 'lucide-react';

interface Step7Props {
  profileImage: File | string | null;
  setProfileImage: (file: File | string | null) => void;

  adhaarCardFrontImage: File | null;
  setAdhaarCardFrontImage: (file: File | null) => void;

  adhaarCardBackImage: File | null;
  setAdhaarCardBackImage: (file: File | null) => void;

  onBack: () => void;
  handleContinue: () => void;
  onClose: () => void;

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
  onClose,
  errorMessage,
  isSubmitting = false,
}) => {
  return (
    <div className="relative space-y-6">

      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 transition"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4">
        <button type="button" onClick={onBack}>
          <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-rose-600 transition" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          Aadhaar & Photo Verification
        </h2>
      </div>

      {/* PROFILE IMAGE */}
      <div>
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
            className="bg-white"
          />
          <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>

        {profileImage && typeof profileImage !== 'string' && (
          <p className="text-sm mt-1 text-gray-600">{profileImage.name}</p>
        )}
      </div>

      {/* AADHAAR FRONT */}
      <div>
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
            className="bg-white"
          />
          <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>

        {adhaarCardFrontImage && (
          <p className="text-sm mt-1 text-gray-600">{adhaarCardFrontImage.name}</p>
        )}
      </div>

      {/* AADHAAR BACK */}
      <div>
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
            className="bg-white"
          />
          <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>

        {adhaarCardBackImage && (
          <p className="text-sm mt-1 text-gray-600">{adhaarCardBackImage.name}</p>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      {/* SUBMIT BUTTON */}
      <Button
        onClick={handleContinue}
        disabled={isSubmitting}
        className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 font-medium shadow-lg"
      >
        {isSubmitting ? 'Submitting...' : 'Continue'}
      </Button>

    </div>
  );
};

export default Step7Form;
