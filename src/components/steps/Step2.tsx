'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft,X } from 'lucide-react';

interface Step2FormProps {
  religion: string;
  setReligion: (value: string) => void;

willingToMarryOtherCaste: boolean | null;
setWillingToMarryOtherCaste: (value: boolean) => void;
  caste: string;
  setCaste: (value: string) => void;
  community: string;
  setCommunity: (value: string) => void;
  gotra: string;
  setGotra: (value: string) => void;
  motherTongue: string;
  setMotherTongue: (value: string) => void;
  onBack: () => void;
  handleContinue: () => void;
    onClose: () => void; // ✅ Add onClose

}

const Step2Form: React.FC<Step2FormProps> = ({
  religion,
  setReligion,
  willingToMarryOtherCaste,
  setWillingToMarryOtherCaste,
  caste,
  setCaste,
  community,
  setCommunity,
  gotra,
  setGotra,
  motherTongue,
  setMotherTongue,
  onBack,
  handleContinue,
    onClose, // ✅ correctly included
}) => (
    

    <div className="relative bg-white p-6 rounded-md shadow-md">
    {/* Cross Button */}
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
        Religion & Community
      </h2>
    </div>

    <div className="space-y-4 mb-6">
      {/* Religion */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Religion *</Label>
        <Select value={religion} onValueChange={setReligion}>
          <SelectTrigger>
            <SelectValue placeholder="Select your religion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hindu">Hindu</SelectItem>
            <SelectItem value="Muslim">Muslim</SelectItem>
            <SelectItem value="Christian">Christian</SelectItem>
            <SelectItem value="Sikh">Sikh</SelectItem>
            <SelectItem value="Jain">Jain</SelectItem>
            <SelectItem value="Buddhist">Buddhist</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Willing to Marry Other Caste */}
<div>
  <Label className="text-sm font-medium text-gray-700 mb-2 block">
    Willing to Marry Other Caste *
  </Label>
  <Select
    value={willingToMarryOtherCaste === null ? '' : String(willingToMarryOtherCaste)}
    onValueChange={(val) => setWillingToMarryOtherCaste(val === 'true')}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select preference" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="true">Yes</SelectItem>
      <SelectItem value="false">No</SelectItem>
    </SelectContent>
  </Select>
</div>


      {/* Caste */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Caste</Label>
        <Input
          placeholder="Enter your caste (optional)"
          value={caste}
          onChange={(e) => setCaste(e.target.value)}
          className="w-full bg-white"
        />
      </div>

      {/* Community */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Community</Label>
        <Input
          placeholder="Enter your community (optional)"
          value={community}
          onChange={(e) => setCommunity(e.target.value)}
          className="w-full bg-white"
        />
      </div>

      {/* Gotra */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Gotra</Label>
        <Input
          placeholder="Enter your gotra (optional)"
          value={gotra}
          onChange={(e) => setGotra(e.target.value)}
          className="w-full bg-white"
        />
      </div>

      {/* Mother Tongue */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Mother Tongue *</Label>
        <Select value={motherTongue} onValueChange={setMotherTongue}>
          <SelectTrigger>
            <SelectValue placeholder="Select your mother tongue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hindi">Hindi</SelectItem>
            <SelectItem value="Bengali">Bengali</SelectItem>
            <SelectItem value="Telugu">Telugu</SelectItem>
            <SelectItem value="Marathi">Marathi</SelectItem>
            <SelectItem value="Tamil">Tamil</SelectItem>
            <SelectItem value="Urdu">Urdu</SelectItem>
            <SelectItem value="Gujarati">Gujarati</SelectItem>
            <SelectItem value="Malayalam">Malayalam</SelectItem>
            <SelectItem value="Kannada">Kannada</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Button
      onClick={handleContinue}
      className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
    >
      Continue
    </Button>
      </div>
  );



export default Step2Form;
