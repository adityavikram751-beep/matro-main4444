'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft,X  } from 'lucide-react';

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
    onClose: () => void; // ✅ Add onClose

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
    onClose, // ✅ receive onClose

}) => (
  <>
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
        Location & Education
      </h2>
    </div>

    <div className="space-y-4 mb-6">
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Country *
        </Label>
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

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          State *
        </Label>
        <Input
          type="text"
          placeholder="Enter your state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full bg-white"
          required
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          City *
        </Label>
        <Input
          type="text"
          placeholder="Enter your city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full bg-white"
          required
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Highest Education *
        </Label>
        <Select value={highestEducation} onValueChange={setHighestEducation}>
          <SelectTrigger>
            <SelectValue placeholder="Select your highest education" />
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

    <p className="text-sm text-gray-600 mb-6">
      Provide your location and education details to help us find better matches.
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

export default Step5Form;
