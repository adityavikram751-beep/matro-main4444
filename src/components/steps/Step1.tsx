'use client';

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  onClose: () => void;
}

export default function Step1Form({
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
  onClose
}: Step1FormProps) {

  return (
    <div className="space-y-6">

      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800">
        Please provide your basic details
      </h2>

      {/* Profile selection */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Profile For *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {profileOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setProfileFor(opt.id)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                profileFor === opt.id
                  ? "bg-rose-700 text-white border-rose-700 shadow"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-rose-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Names */}
      <div>
        <Label className="font-medium">First Name *</Label>
        <Input
          value={FirstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter first name"
        />
      </div>

      <div>
        <Label className="font-medium">Middle Name</Label>
        <Input
          value={MiddleName}
          onChange={(e) => setMiddleName(e.target.value)}
          placeholder="Enter middle name"
        />
      </div>

      <div>
        <Label className="font-medium">Last Name *</Label>
        <Input
          value={LastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter last name"
        />
      </div>

      {/* DOB */}
      <div>
        <Label className="font-medium">Date of Birth *</Label>
        <Input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
      </div>

      {/* Gender */}
      <div>
        <Label className="font-medium">Gender *</Label>
        <RadioGroup value={gender} onValueChange={setGender} className="flex gap-6 mt-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="Male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="Female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Marital Status */}
      <div>
        <Label className="font-medium">Marital Status *</Label>
        <RadioGroup value={maritalStatus} onValueChange={setMaritalStatus} className="flex gap-6 mt-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="Unmarried" id="unmarried" />
            <Label htmlFor="unmarried">Unmarried</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="Divorced" id="divorced" />
            <Label htmlFor="divorced">Divorced</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="Widowed" id="widowed" />
            <Label htmlFor="widowed">Widowed</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Children fields */}
      <div>
        <Label className="font-medium">Number of Children</Label>
        <Input
          type="number"
          min={0}
          value={numberOfChildren}
          onChange={(e) => setNumberOfChildren(Number(e.target.value))}
        />
      </div>

      <div>
        <Label className="font-medium">Children Living With You?</Label>
        <RadioGroup
          value={String(isChildrenLivingWithYou)}
          onValueChange={(v) => setIsChildrenLivingWithYou(v === "true")}
          className="flex gap-6 mt-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="true" id="with-yes" />
            <Label htmlFor="with-yes">Yes</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="false" id="with-no" />
            <Label htmlFor="with-no">No</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 mt-4"
      >
        Continue
      </Button>
    </div>
  );
}
