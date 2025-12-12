'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, X } from 'lucide-react';

interface Step5FormProps {
  country: string;
  setCountry: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  highestEducation: string;
  setHighestEducation: (value: string) => void;
  onBack: () => void;
  handleContinue: () => void;
  onClose: () => void;
}

const Step5Form: React.FC<Step5FormProps> = ({
  country,
  setCountry,
  state,
  setState,
  city,
  setCity,
  highestEducation,
  setHighestEducation,
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
          Location & Education
        </h2>
      </div>

      {/* FORM CONTENT */}
      <div className="space-y-5">

        {/* COUNTRY */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Country *</Label>

          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* STATE */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">State *</Label>

          <Input
            placeholder="Enter your state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-white"
          />
        </div>

        {/* CITY */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">City *</Label>

          <Input
            placeholder="Enter your city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-white"
          />
        </div>

        {/* EDUCATION */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Highest Education *</Label>

          <Select value={highestEducation} onValueChange={setHighestEducation}>
            <SelectTrigger>
              <SelectValue placeholder="Select highest education" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Diploma">Diploma</SelectItem>
              <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
              <SelectItem value="Master's Degree">Master's Degree</SelectItem>
              <SelectItem value="Doctorate">Doctorate</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* HELP TEXT */}
      <p className="text-sm text-gray-600">
        Your location & education details help us show better profile recommendations.
      </p>

      {/* BUTTON */}
      <Button
        onClick={handleContinue}
        className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 font-medium shadow-lg transition-all"
      >
        Continue
      </Button>

    </div>
  );
};

export default Step5Form;
