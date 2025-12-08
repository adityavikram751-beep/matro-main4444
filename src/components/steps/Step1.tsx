'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft } from 'lucide-react';
import { Input } from '../ui/input';
import { X } from 'lucide-react'; // ✅ Import X icon

const profileOptions = [
  { id: 'myself', label: 'Myself' },
  { id: 'son', label: 'Son' },
  { id: 'daughter', label: 'Daughter' },
  { id: 'brother', label: 'Brother' },
  { id: 'sister', label: 'Sister' },
  { id: 'friend', label: 'Friend' },
  { id: 'relative', label: 'Relative' },
];

interface Step1FormProps {
  profileFor: string;
  setProfileFor: (value: string) => void;
  FirstName: string;
  setFirstName: (value: string) => void;
  MiddleName: string;
  setMiddleName: (value: string) => void;
  LastName: string;
  setLastName: (value: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  maritalStatus: string;
  setMaritalStatus: (value: string) => void;
  numberOfChildren: number;
  setNumberOfChildren: (value: number) => void;
  isChildrenLivingWithYou: boolean;
  setIsChildrenLivingWithYou: (value: boolean) => void;
  handleContinue: () => void;
    onClose: () => void; // ✅ Add this prop

}

const Step1Form: React.FC<Step1FormProps> = ({
  profileFor,
  setProfileFor,
  FirstName,
  setFirstName,
  MiddleName,
  setMiddleName,
  LastName,
  setLastName,
  dateOfBirth,
  setDateOfBirth,
  gender,
  setGender,
  maritalStatus,
  setMaritalStatus,
  numberOfChildren,
  setNumberOfChildren,
  isChildrenLivingWithYou,
  setIsChildrenLivingWithYou,
  handleContinue,
  onClose,
  }) => {
  return (
    <div className="relative bg-white p-6 rounded-md shadow-md">
      {/* Cross Button */}
<button
  onClick={onClose}
  className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 transition"
>
  <X className="w-5 h-5 text-gray-600" />
</button>
      <div className="flex items-center space-x-3 mb-6">
        <ArrowLeft className="h-5 w-5 text-gray-500" />
        <h2 className="text-xl font-semibold text-gray-900">
          Please provide your basic details:
        </h2>
      </div>

      {/* Profile selection */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Select a profile for
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {profileOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setProfileFor(option.id)}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                profileFor === option.id
                  ? 'bg-rose-700 text-white border-rose-700 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-rose-300 hover:bg-rose-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rest of the form fields */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">First Name *</Label>
        <Input
          type="text"
          placeholder="Enter first name"
          value={FirstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full bg-white"
        />
      </div>

      {/* Middle Name */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Middle Name</Label>
        <Input
          type="text"
          placeholder="Enter middle name"
          value={MiddleName}
          onChange={(e) => setMiddleName(e.target.value)}
          className="w-full bg-white"
        />
      </div>

      {/* Last Name */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Last Name *</Label>
        <Input
          type="text"
          placeholder="Enter last name"
          value={LastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full bg-white"
        />
      </div>

      {/* Date of Birth */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Date of Birth *</Label>
        <Input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="w-full bg-white"
        />
      </div>

      {/* Gender */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Gender *</Label>
        <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Male" id="male" />
            <Label htmlFor="male" className="font-medium">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Female" id="female" />
            <Label htmlFor="female" className="font-medium">Female</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Marital Status */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Marital Status *</Label>
        <RadioGroup value={maritalStatus} onValueChange={setMaritalStatus} className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Unmarried" id="unmarried" />
            <Label htmlFor="unmarried" className="font-medium">Unmarried</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Divorced" id="divorced" />
            <Label htmlFor="divorced" className="font-medium">Divorced</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Widowed" id="widowed" />
            <Label htmlFor="widowed" className="font-medium">Widowed</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Number of Children */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Number of Children</Label>
        <Input
          type="number"
          placeholder="Enter number of children"
          value={numberOfChildren}
          onChange={(e) => setNumberOfChildren(Number(e.target.value))}
          className="w-full bg-white"
          min={0}
        />
      </div>

      {/* Children Living With You */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Children Living With You</Label>
        <RadioGroup
          value={isChildrenLivingWithYou.toString()}
          onValueChange={(value) => setIsChildrenLivingWithYou(value === 'true')}
          className="flex space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="children-yes" />
            <Label htmlFor="children-yes" className="font-medium">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="children-no" />
            <Label htmlFor="children-no" className="font-medium">No</Label>
          </div>
        </RadioGroup>
      </div>

      <Button
        onClick={handleContinue}
        className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
      >
        Continue
      </Button>
    </div>
  );
};

export default Step1Form;