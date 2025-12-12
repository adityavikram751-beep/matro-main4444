'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, X } from 'lucide-react';

interface Step4FormProps {
  familyType: string;
  setFamilyType: (value: string) => void;
  familyStatus: string;
  setFamilyStatus: (value: string) => void;
  onBack: () => void;
  handleContinue: () => void;
  onClose: () => void; 
}

const Step4Form: React.FC<Step4FormProps> = ({
  familyType,
  setFamilyType,
  familyStatus,
  setFamilyStatus,
  onBack,
  handleContinue,
  onClose
}) => {
  return (
    <div className="space-y-6">

      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 transition"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}>
          <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-rose-600 transition" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          Family Background
        </h2>
      </div>

      {/* FORM BODY */}
      <div className="space-y-5">

        {/* Family Type */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Family Type *
          </Label>

          <Select value={familyType} onValueChange={setFamilyType}>
            <SelectTrigger>
              <SelectValue placeholder="Select family type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nuclear">Nuclear</SelectItem>
              <SelectItem value="Joint">Joint</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Family Status */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Family Status *
          </Label>

          <Select value={familyStatus} onValueChange={setFamilyStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select family status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Middle Class">Middle Class</SelectItem>
              <SelectItem value="Upper Middle Class">Upper Middle Class</SelectItem>
              <SelectItem value="High Class">High Class</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* HELPER TEXT */}
      <p className="text-sm text-gray-600 leading-relaxed">
        Providing accurate family background helps us improve match accuracy and recommendations.
      </p>

      {/* CONTINUE */}
      <Button
        onClick={handleContinue}
        className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 font-medium shadow-lg transition-all"
      >
        Continue
      </Button>

    </div>
  );
};

export default Step4Form;
