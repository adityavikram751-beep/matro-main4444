'use client';

import Image from 'next/image';
import { useState } from 'react';
import ProfilePreferenceForm from './Preference';

interface PreferenceData {
  gender: string;
  minAge: number;
  maxAge: number;
  minHeight: number;
  maxHeight: number;
  minWeight: number;
  maxWeight: number;
  religion: string;
  caste: string;
  community: string;
  maritalStatus: string;
  designation: string;
  gotra: string;
  highestEducation: string;
  income: string;
  state: string;
  city: string;
}

const Hero: React.FC = () => {
  const [lookingFor, setLookingFor] = useState('Women');
  const [ageFrom, setAgeFrom] = useState(22);
  const [ageTo, setAgeTo] = useState(27);
  const [religion, setReligion] = useState('Hindu');
  const [motherTongue, setMotherTongue] = useState('English');
  const [showPreferenceForm, setShowPreferenceForm] = useState(false);

 

  const handleDetailedPreferences = () => {
    setShowPreferenceForm(true);
  };

  const handlePreferenceSubmit = async (preferenceData: PreferenceData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch('https://matrimonial-backend-7ahc.onrender.com/api/partner/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferenceData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save preferences');
      }

      const result = await response.json();
      console.log('Preferences saved successfully:', result);
      setShowPreferenceForm(false);
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handlePreferenceCancel = () => {
    setShowPreferenceForm(false);
  };

  return (
    <>
      <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center">
          <div className="w-full flex flex-col justify-center pl-16 pr-8 py-24 mb-40">
            <h1 className="text-5xl font-medium text-[#343434] leading-tight font-Lato">
              A Pure Path to Marriage — <br />
              With Love and Trust at Heart
            </h1>
            <p className="text-1xl font-light text-[#757575] mt-6 font-Lato">
              This is more than just a matrimonial app. It's a heartfelt journey toward companionship, built on honesty, care, and community — without pressure or payment.
            </p>
          </div>
        </div>
        <div className="relative flex items-center justify-end">
          <Image
            src="/assets/heroimage.png"
            alt="hero"
            layout="fill"
            objectFit="cover"
            className="w-full h-full object-cover"
            priority
          />
        </div>
        
        {/* Mobile Search Form */}
        <div className="block lg:hidden w-full px-8 mt-6">
          <div className="flex flex-col gap-4 bg-white p-4 shadow-xl border border-gray-200 rounded-md">
            <div className="flex flex-col">
              <label className="text-sm mb-1 font-medium text-[#757575] font-sans">I'm looking for a</label>
              <select 
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                className="border-[#6F0000] border p-2 text-md font-medium rounded w-full font-Mulish"
              >
                <option>Women</option>
                <option>Men</option>
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex flex-col">
                <label className="text-sm mb-1 font-medium text-[#757575] font-sans">Age</label>
                <input 
                  type="number" 
                  min="18" 
                  max="99" 
                  value={ageFrom}
                  onChange={(e) => setAgeFrom(Number(e.target.value))}
                  className="border border-[#6F0000] p-2 text-md font-medium rounded w-20 font-Mulish" 
                />
              </div>
              <div className="pb-2 text-md font-medium font-Mulish">to</div>
              <div className="flex flex-col">
                <label className="invisible font-medium">Age</label>
                <input 
                  type="number" 
                  min="18" 
                  max="99" 
                  value={ageTo}
                  onChange={(e) => setAgeTo(Number(e.target.value))}
                  className="border border-[#6F0000] p-2 text-md font-medium rounded w-20 font-Mulish" 
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1 font-medium text-[#757575] font-sans">Of Religion</label>
              <select 
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                className="border-[#6F0000] border p-2 text-md font-medium rounded w-full font-Mulish"
              >
                <option>Hindu</option>
                <option>Muslim</option>
                <option>Christian</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1 font-medium text-[#757575] font-sans">And Mother Tongue</label>
              <select 
                value={motherTongue}
                onChange={(e) => setMotherTongue(e.target.value)}
                className="border-[#6F0000] border p-2 text-md font-medium rounded w-full font-Mulish"
              >
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>
            
            {/* Button Group */}
            <div className="flex flex-col gap-2">
            
              <button
                type="button"
                className="bg-white text-[#7D0A0A] border-2 border-[#7D0A0A] w-full py-3 rounded text-md font-semibold font-Mulish shadow-md hover:bg-[#7D0A0A] hover:text-white transition-colors duration-200"
                onClick={handleDetailedPreferences}
              >
                Set Detailed Preferences
              </button>
            </div>
          </div>
        </div>
        
        {/* Desktop Search Form */}
        <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 top-[440px] z-20 w-full max-w-5xl">
          <div className="flex flex-col items-center justify-center gap-4 bg-white px-6 py-5 shadow-2xl border border-gray-200 w-full">
            {/* Main Search Row */}
            <div className="flex items-center justify-evenly gap-6 w-full">
              <div className="flex flex-col">
                <label className="text-sm mb-1 font-medium text-[#1C1C1C] font-sans">I'm looking for a</label>
                <select 
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  className="border-[#6F0000] border p-2 text-md font-medium rounded min-w-[120px] font-Mulish"
                >
                  <option>Women</option>
                  <option>Men</option>
                </select>
              </div>
              <div className="flex items-end gap-2 text-md font-medium font-Mulish">
                <div className="flex flex-col">
                  <label className="text-sm mb-1 font-medium text-[#1C1C1C] font-sans">Age</label>
                  <input 
                    type="number" 
                    min="18" 
                    max="99" 
                    value={ageFrom}
                    onChange={(e) => setAgeFrom(Number(e.target.value))}
                    className="border border-[#6F0000] p-2 text-md font-medium rounded w-16 font-Mulish" 
                  />
                </div>
                <div className="pb-2">to</div>
                <div className="flex flex-col">
                  <label className="invisible font-medium">Age</label>
                  <input 
                    type="number" 
                    min="18" 
                    max="99" 
                    value={ageTo}
                    onChange={(e) => setAgeTo(Number(e.target.value))}
                    className="border border-[#6F0000] p-2 text-md font-medium rounded w-16 font-Mulish" 
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm mb-1 font-medium text-[#1C1C1C] font-sans">Of Religion</label>
                <select 
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="border-[#6F0000] border p-2 text-md font-medium rounded min-w-[120px] font-Mulish"
                >
                  <option>Hindu</option>
                  <option>Muslim</option>
                  <option>Christian</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm mb-1 font-medium text-[#1C1C1C] font-sans">And Mother Tongue</label>
                <select 
                  value={motherTongue}
                  onChange={(e) => setMotherTongue(e.target.value)}
                  className="border-[#6F0000] border p-2 text-md font-medium rounded min-w-[120px] font-Mulish"
                >
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div className="mt-4">
             
              <button
                type="button"
                className="bg-[#7D0A0A] text-white border-2 border-[#7B0A0A] px-8 py-3 rounded text-md font-semibold font-Mulish shadow-md hover:bg-[#7D0A0A] hover:text-white transition-colors duration-200"
                onClick={handleDetailedPreferences}
              >
                Set  Preferences
              </button>
            </div>
            </div>
            
            {/* Button Row */}
            
          </div>
        </div>
      </div>

      {/* Preference Form Modal */}
      {showPreferenceForm && (
        <ProfilePreferenceForm
          onSubmit={handlePreferenceSubmit}
          onCancel={handlePreferenceCancel}
          initialData={{
            gender: lookingFor === 'Women' ? 'Female' : 'Male',
            minAge: ageFrom,
            maxAge: ageTo,
            minHeight: 150,
            maxHeight: 200,
            minWeight: 40,
            maxWeight: 100,
            religion,
            caste: '',
            community: motherTongue,
            maritalStatus: 'Never Married',
            designation: '',
            gotra: '',
            highestEducation: '',
            income: '',
            state: '',
            city: ''
          }}
        />
      )}
    </>
  );
};

export default Hero;