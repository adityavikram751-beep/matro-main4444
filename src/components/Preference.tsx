'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, MapPin, Heart, Briefcase } from 'lucide-react';

interface PreferenceData {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  minWeight?: number;
  maxWeight?: number;
  religion?: string;
  caste?: string;
  community?: string;
  maritalStatus?: string;
  designation?: string;
  gotra?: string;
  highestEducation?: string;
  income?: string;
  state?: string;
  city?: string;
}

interface PreferenceFormProps {
  onSubmit?: (data: PreferenceData) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<PreferenceData>;
}

const ProfilePreferenceForm: React.FC<PreferenceFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PreferenceData>({
    gender: initialData.gender,
    minAge: initialData.minAge,
    maxAge: initialData.maxAge,
    minHeight: initialData.minHeight,
    maxHeight: initialData.maxHeight,
    minWeight: initialData.minWeight,
    maxWeight: initialData.maxWeight,
    religion: initialData.religion,
    caste: initialData.caste,
    community: initialData.community,
    maritalStatus: initialData.maritalStatus,
    designation: initialData.designation,
    gotra: initialData.gotra,
    highestEducation: initialData.highestEducation,
    income: initialData.income,
    state: initialData.state,
    city: initialData.city,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: keyof PreferenceData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => currentStep < 4 && setCurrentStep(currentStep + 1);
  const handlePrevious = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulate API
      onSubmit?.(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderNumberInput = (
    field: keyof PreferenceData,
    placeholder: string,
    min?: number,
    max?: number
  ) => (
    <input
      type="number"
      value={formData[field] ?? ''}
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={e => {
        const val = e.target.value;
        updateFormData(field, val === '' ? undefined : Number(val));
      }}
      className="border border-[#6F0000] p-2 sm:p-3 text-sm sm:text-md font-medium rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#7D0A0A] focus:border-transparent font-Mulish"
    />
  );

  const renderDropdown = (
    field: keyof PreferenceData,
    placeholder: string,
    options: string[]
  ) => (
    <select
      value={formData[field] ?? ''}
      onChange={e => updateFormData(field, e.target.value || undefined)}
      className="border border-[#6F0000] p-2 sm:p-3 text-sm sm:text-md font-medium rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#7D0A0A] focus:border-transparent font-Mulish appearance-none"
    >
      <option value="">{placeholder}</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>{opt}</option>
      ))}
    </select>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <User className="text-[#7D0A0A] h-5 w-5 sm:h-6 sm:w-6" />
              <h3 className="text-lg sm:text-xl font-semibold text-[#343434] font-Lato">Basic Preferences</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col">
                <label className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium text-[#757575] font-sans">Looking for</label>
                {renderDropdown('gender', 'Select Gender', ['Female', 'Male'])}
              </div>

              <div className="flex flex-col sm:col-span-2">
                <label className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium text-[#757575] font-sans">Age Range</label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1">
                    {renderNumberInput('minAge', 'Min Age', 18, 99)}
                  </div>
                  <span className="text-sm sm:text-md font-medium font-Mulish text-[#757575] shrink-0">to</span>
                  <div className="flex-1">
                    {renderNumberInput('maxAge', 'Max Age', 18, 99)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:col-span-2">
                <label className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium text-[#757575] font-sans">Height Range (cm)</label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1">
                    {renderNumberInput('minHeight', 'Min Height', 100, 250)}
                  </div>
                  <span className="text-sm sm:text-md font-medium font-Mulish text-[#757575] shrink-0">to</span>
                  <div className="flex-1">
                    {renderNumberInput('maxHeight', 'Max Height', 100, 250)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:col-span-2">
                <label className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium text-[#757575] font-sans">Weight Range (kg)</label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1">
                    {renderNumberInput('minWeight', 'Min Weight', 30, 200)}
                  </div>
                  <span className="text-sm sm:text-md font-medium font-Mulish text-[#757575] shrink-0">to</span>
                  <div className="flex-1">
                    {renderNumberInput('maxWeight', 'Max Weight', 30, 200)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Heart className="text-[#7D0A0A] h-5 w-5 sm:h-6 sm:w-6" />
              <h3 className="text-lg sm:text-xl font-semibold text-[#343434] font-Lato">Religious & Cultural Preferences</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="sm:col-span-2">
                {renderDropdown('religion', 'Select Religion', ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'])}
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium text-[#757575] font-sans">Gotra</label>
                <input
                  type="text"
                  value={formData.gotra ?? ''}
                  onChange={e => updateFormData('gotra', e.target.value || undefined)}
                  placeholder="Enter Gotra"
                  className="border border-[#6F0000] p-2 sm:p-3 text-sm sm:text-md rounded-md focus:outline-none focus:ring-2 focus:ring-[#7D0A0A] font-Mulish"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium text-[#757575] font-sans">Caste</label>
                <input
                  type="text"
                  value={formData.caste ?? ''}
                  onChange={e => updateFormData('caste', e.target.value || undefined)}
                  placeholder="Enter Caste"
                  className="border border-[#6F0000] p-2 sm:p-3 text-sm sm:text-md rounded-md focus:outline-none focus:ring-2 focus:ring-[#7D0A0A] font-Mulish"
                />
              </div>
              
              <div className="sm:col-span-2 flex flex-col">
                <label className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium text-[#757575] font-sans">Community</label>
                <input
                  type="text"
                  value={formData.community ?? ''}
                  onChange={e => updateFormData('community', e.target.value || undefined)}
                  placeholder="Enter Community"
                  className="border border-[#6F0000] p-2 sm:p-3 text-sm sm:text-md rounded-md focus:outline-none focus:ring-2 focus:ring-[#7D0A0A] font-Mulish"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Briefcase className="text-[#7D0A0A] h-5 w-5 sm:h-6 sm:w-6" />
              <h3 className="text-lg sm:text-xl font-semibold text-[#343434] font-Lato">Professional & Educational Preferences</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="sm:col-span-2">
                {renderDropdown('maritalStatus', 'Select Marital Status', ['Never Married', 'Divorced', 'Widowed', 'Separated'])}
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium text-[#757575] font-sans">Designation</label>
                <input
                  type="text"
                  value={formData.designation ?? ''}
                  onChange={e => updateFormData('designation', e.target.value || undefined)}
                  placeholder="Enter Designation"
                  className="border border-[#6F0000] p-2 sm:p-3 text-sm sm:text-md rounded-md focus:outline-none focus:ring-2 focus:ring-[#7D0A0A] font-Mulish"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium text-[#757575] font-sans">Highest Education</label>
                <input
                  type="text"
                  value={formData.highestEducation ?? ''}
                  onChange={e => updateFormData('highestEducation', e.target.value || undefined)}
                  placeholder="Enter Education"
                  className="border border-[#6F0000] p-2 sm:p-3 text-sm sm:text-md rounded-md focus:outline-none focus:ring-2 focus:ring-[#7D0A0A] font-Mulish"
                />
              </div>
              
              <div className="sm:col-span-2">
                {renderDropdown('income', 'Select Income Range', ['0-3 LPA', '3-5 LPA', '5-10 LPA', '10-15 LPA', '15-25 LPA', '25-50 LPA', '50+ LPA'])}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <MapPin className="text-[#7D0A0A] h-5 w-5 sm:h-6 sm:w-6" />
              <h3 className="text-lg sm:text-xl font-semibold text-[#343434] font-Lato">Location Preferences</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col sm:col-span-2">
                <label className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium text-[#757575] font-sans">State</label>
                <input
                  type="text"
                  value={formData.state ?? ''}
                  onChange={e => updateFormData('state', e.target.value || undefined)}
                  placeholder="Enter State"
                  className="border border-[#6F0000] p-2 sm:p-3 text-sm sm:text-md rounded-md focus:outline-none focus:ring-2 focus:ring-[#7D0A0A] font-Mulish"
                />
              </div>

              <div className="flex flex-col sm:col-span-2">
                <label className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium text-[#757575] font-sans">City</label>
                <input
                  type="text"
                  value={formData.city ?? ''}
                  onChange={e => updateFormData('city', e.target.value || undefined)}
                  placeholder="Enter City"
                  className="border border-[#6F0000] p-2 sm:p-3 text-sm sm:text-md rounded-md focus:outline-none focus:ring-2 focus:ring-[#7D0A0A] font-Mulish"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Progress steps indicator
  const renderProgressSteps = () => {
    const steps = ['Basic', 'Cultural', 'Professional', 'Location'];
    return (
      <div className="px-4 sm:px-6 pt-4">
        <div className="flex justify-between relative">
          {/* Progress line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
          <div 
            className="absolute top-4 left-0 h-0.5 bg-[#7D0A0A] -z-10 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>
          
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;
            
            return (
              <div key={step} className="flex flex-col items-center relative">
                <div 
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-md font-semibold transition-all duration-300
                    ${isActive ? 'bg-[#7D0A0A] text-white ring-4 ring-[#7D0A0A]/20' : 
                      isCompleted ? 'bg-[#7D0A0A] text-white' : 
                      'bg-gray-200 text-gray-500'}`}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className={`text-xs sm:text-sm mt-2 font-medium whitespace-nowrap ${
                  isActive ? 'text-[#7D0A0A]' : 'text-gray-500'
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#343434] font-Lato">Set Your Preferences</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Step {currentStep} of 4</p>
            </div>
            <button 
              onClick={onCancel} 
              className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl font-bold leading-none p-1 hover:bg-gray-100 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        {renderProgressSteps()}

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 flex-1 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-b-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-[#7D0A0A] font-medium rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-Mulish w-full sm:w-auto justify-center"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-md">Previous</span>
            </button>

            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center gap-1 sm:gap-2 bg-[#7D0A0A] text-white px-4 sm:px-6 py-2 rounded-md font-semibold hover:bg-[#5A0707] transition-colors font-Mulish w-full sm:w-auto text-sm sm:text-md"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#7D0A0A] text-white px-6 sm:px-8 py-2 rounded-md font-semibold hover:bg-[#5A0707] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-Mulish w-full sm:w-auto text-sm sm:text-md"
                >
                  {isSubmitting ? 'Saving...' : 'Save Preferences'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreferenceForm;