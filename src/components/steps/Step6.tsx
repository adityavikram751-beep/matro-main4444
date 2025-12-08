'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft,X  } from 'lucide-react';

interface Step6FormProps {
  employedIn: string;
  setEmployedIn: (value: string) => void;
  annualIncome: string;
  setAnnualIncome: (value: string) => void;
  workLocation: string;
  setWorkLocation: (value: string) => void;
  designation: string;
  setDesignation: (value: string) => void;
  onBack: () => void;
  handleContinue: () => void;
    onClose: () => void; // ✅ Add onClose

}

const Step6Form: React.FC<Step6FormProps> = ({
  employedIn,
  setEmployedIn,
  annualIncome,
  setAnnualIncome,
  workLocation,
  setWorkLocation,
  designation,
  setDesignation,
  onBack,
  handleContinue,
    onClose, // ✅ receive onClose

}) => (
  <>
      {/* Cross button */}
    <button
      onClick={onClose}
      className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 transition"
    >
      <X className="w-5 h-5 text-gray-600" />
    </button>

    <div className="flex items-center space-x-3 mb-6">
      <button onClick={onBack}>
        <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-rose-600 transition-colors" />
      </button>
      <h2 className="text-xl font-semibold text-gray-900">
        Professional Details
      </h2>
    </div>

    <div className="space-y-4 mb-6">
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Employed In *
        </Label>
        <Select value={employedIn} onValueChange={setEmployedIn}>
          <SelectTrigger>
            <SelectValue placeholder="Select employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Private">Private</SelectItem>
            <SelectItem value="Government">Government</SelectItem>
            <SelectItem value="Self-Employed">Self-Employed</SelectItem>
            <SelectItem value="Not Employed">Not Employed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Annual Income *
        </Label>
        <Select value={annualIncome} onValueChange={setAnnualIncome}>
          <SelectTrigger>
            <SelectValue placeholder="Select annual income" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-5 LPA">0-5 LPA</SelectItem>
            <SelectItem value="5-10 LPA">5-10 LPA</SelectItem>
            <SelectItem value="10-20 LPA">10-20 LPA</SelectItem>
            <SelectItem value="20+ LPA">20+ LPA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Work Location *
        </Label>
        <Input
          placeholder="Enter your work location"
          value={workLocation}
          onChange={(e) => setWorkLocation(e.target.value)}
          className="w-full bg-white"
          required
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Designation *
        </Label>
        <Input
          placeholder="Enter your designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          className="w-full bg-white"
          required
        />
      </div>
    </div>

    <p className="text-sm text-gray-600 mb-6">
      Provide your professional details to help us find better matches.
    </p>

    <Button
      onClick={handleContinue}
      className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
      size="lg"
    >
      Continue
    </Button>
  </>
);

export default Step6Form;
