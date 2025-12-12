'use client';

import { useState } from 'react';
import Step1Form from './Step1';
import Step2Form from './Step2';
import Step3Form from './Step3';
import Step4Form from './Step4';
import Step5Form from './Step5';
import Step6Form from './Step6';
import Step7Form from './Step7';

interface MultiStepFormProps {
  onClose: () => void;
  onSuccess?: (profileData: any) => void;
}

export default function MultiStepForm({ onClose, onSuccess }: MultiStepFormProps) {
  const [step, setStep] = useState(1);
  const [showForm, setShowForm] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ---------------- STATE ----------------
  const [profileFor, setProfileFor] = useState('');
  const [FirstName, setFirstName] = useState('');
  const [MiddleName, setMiddleName] = useState('');
  const [LastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [isChildrenLivingWithYou, setIsChildrenLivingWithYou] = useState(false);

  const [religion, setReligion] = useState('');
  const [willingToMarryOtherCaste, setWillingToMarryOtherCaste] = useState<boolean | null>(null);
  const [caste, setCaste] = useState('');
  const [community, setCommunity] = useState('');
  const [gotra, setGotra] = useState('');
  const [motherTongue, setMotherTongue] = useState('');

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [complexion, setComplexion] = useState('');
  const [anyDisability, setAnyDisability] = useState(false);
  const [diet, setDiet] = useState('');

  const [familyType, setFamilyType] = useState('');
  const [familyStatus, setFamilyStatus] = useState('');

  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [highestEducation, setHighestEducation] = useState('');

  const [employedIn, setEmployedIn] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [designation, setDesignation] = useState('');

  const [profileImage, setProfileImage] = useState<File | string | null>(null);
  const [adhaarCardFrontImage, setAdhaarCardFrontImage] = useState<File | null>(null);
  const [adhaarCardBackImage, setAdhaarCardBackImage] = useState<File | null>(null);

  // ------------- CLOSE HANDLER -------------
  const handleClose = () => {
    setShowForm(false);
    onClose();
  };

  // ---------------- VALIDATION ----------------
  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        return !!(profileFor && FirstName && LastName && dateOfBirth && gender && maritalStatus);
      case 2:
        return !!(religion && motherTongue && willingToMarryOtherCaste !== null);
      case 3:
        return !!(height && weight && complexion && diet);
      case 4:
        return !!(familyType && familyStatus);
      case 5:
        return !!(country && state && city && highestEducation);
      case 6:
        return !!(employedIn && annualIncome && workLocation && designation);
      case 7:
        return !!(profileImage && adhaarCardFrontImage && adhaarCardBackImage);
      default:
        return true;
    }
  };

  // ---------------- NAVIGATION ----------------
  const handleNext = () => {
    if (!validateStep()) {
      alert(`Please fill required fields in step ${step}`);
      return;
    }
    if (step < 7) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else handleClose();
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    if (!validateStep()) {
      alert('Please complete required fields before submitting.');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      alert('You must be logged in to submit the profile.');
      return;
    }

    setSubmitting(true);

    const formDataObj = new FormData();
    formDataObj.append('profileFor', profileFor);
    formDataObj.append('FirstName', FirstName);
    formDataObj.append('MiddleName', MiddleName);
    formDataObj.append('LastName', LastName);
    formDataObj.append('dateOfBirth', dateOfBirth);
    formDataObj.append('gender', gender);
    formDataObj.append('maritalStatus', maritalStatus);
    formDataObj.append('numberOfChildren', numberOfChildren.toString());
    formDataObj.append('isChildrenLivingWithYou', isChildrenLivingWithYou.toString());

    formDataObj.append('religion', religion);
    formDataObj.append('willingToMarryOtherCaste', String(willingToMarryOtherCaste));
    formDataObj.append('caste', caste);
    formDataObj.append('community', community);
    formDataObj.append('gotra', gotra);
    formDataObj.append('motherTongue', motherTongue);

    formDataObj.append('height', height);
    formDataObj.append('weight', weight);
    formDataObj.append('complexion', complexion);
    formDataObj.append('anyDisability', anyDisability.toString());
    formDataObj.append('diet', diet);

    formDataObj.append('familyType', familyType);
    formDataObj.append('familyStatus', familyStatus);

    formDataObj.append('country', country);
    formDataObj.append('state', state);
    formDataObj.append('city', city);
    formDataObj.append('highestEducation', highestEducation);

    formDataObj.append('employedIn', employedIn);
    formDataObj.append('annualIncome', annualIncome);
    formDataObj.append('workLocation', workLocation);
    formDataObj.append('designation', designation);

    if (profileImage instanceof File) formDataObj.append('profileImage', profileImage);
    if (adhaarCardFrontImage instanceof File) formDataObj.append('adhaarCardFrontImage', adhaarCardFrontImage);
    if (adhaarCardBackImage instanceof File) formDataObj.append('adhaarCardBackImage', adhaarCardBackImage);

    try {
      const res = await fetch('https://matrimonial-backend-7ahc.onrender.com/auth/profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      alert('Profile Submitted Successfully!');
      onSuccess?.(data);
      handleClose();
    } catch (err: any) {
      console.error('Submission error', err);
      alert(err?.message || 'Something went wrong while submitting');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl mx-4 rounded-lg p-6 shadow-lg overflow-y-auto max-h-[92vh]">
            {/* header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Create Profile</h2>
                <p className="text-sm text-gray-500">Step {step} of 7</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleClose}
                  className="px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 text-sm text-red-600"
                >
                  Close
                </button>
              </div>
            </div>

            {/* form body */}
            <div className="space-y-6">
              {step === 1 && (
                <Step1Form
                  profileFor={profileFor}
                  setProfileFor={setProfileFor}
                  FirstName={FirstName}
                  setFirstName={setFirstName}
                  MiddleName={MiddleName}
                  setMiddleName={setMiddleName}
                  LastName={LastName}
                  setLastName={setLastName}
                  dateOfBirth={dateOfBirth}
                  setDateOfBirth={setDateOfBirth}
                  gender={gender}
                  setGender={setGender}
                  maritalStatus={maritalStatus}
                  setMaritalStatus={setMaritalStatus}
                  numberOfChildren={numberOfChildren}
                  setNumberOfChildren={setNumberOfChildren}
                  isChildrenLivingWithYou={isChildrenLivingWithYou}
                  setIsChildrenLivingWithYou={setIsChildrenLivingWithYou}
                  handleContinue={handleNext}
                  onClose={handleClose}
                />
              )}

              {step === 2 && (
                <Step2Form
                  religion={religion}
                  setReligion={setReligion}
                  willingToMarryOtherCaste={willingToMarryOtherCaste}
                  setWillingToMarryOtherCaste={setWillingToMarryOtherCaste}
                  caste={caste}
                  setCaste={setCaste}
                  community={community}
                  setCommunity={setCommunity}
                  gotra={gotra}
                  setGotra={setGotra}
                  motherTongue={motherTongue}
                  setMotherTongue={setMotherTongue}
                  handleContinue={handleNext}
                  onBack={handleBack}
                  onClose={handleClose}
                />
              )}

              {step === 3 && (
                <Step3Form
                  height={height}
                  setHeight={setHeight}
                  weight={weight}
                  setWeight={setWeight}
                  complexion={complexion}
                  setComplexion={setComplexion}
                  anyDisability={anyDisability}
                  setAnyDisability={setAnyDisability}
                  diet={diet}
                  setDiet={setDiet}
                  handleContinue={handleNext}
                  onBack={handleBack}
                  onClose={handleClose}
                />
              )}

              {step === 4 && (
                <Step4Form
                  familyType={familyType}
                  setFamilyType={setFamilyType}
                  familyStatus={familyStatus}
                  setFamilyStatus={setFamilyStatus}
                  handleContinue={handleNext}
                  onBack={handleBack}
                  onClose={handleClose}
                />
              )}

              {step === 5 && (
                <Step5Form
                  country={country}
                  setCountry={setCountry}
                  state={state}
                  setState={setState}
                  city={city}
                  setCity={setCity}
                  highestEducation={highestEducation}
                  setHighestEducation={setHighestEducation}
                  handleContinue={handleNext}
                  onBack={handleBack}
                  onClose={handleClose}
                />
              )}

              {step === 6 && (
                <Step6Form
                  employedIn={employedIn}
                  setEmployedIn={setEmployedIn}
                  annualIncome={annualIncome}
                  setAnnualIncome={setAnnualIncome}
                  workLocation={workLocation}
                  setWorkLocation={setWorkLocation}
                  designation={designation}
                  setDesignation={setDesignation}
                  handleContinue={handleNext}
                  onBack={handleBack}
                  onClose={handleClose}
                />
              )}

              {step === 7 && (
                <Step7Form
                  profileImage={profileImage}
                  setProfileImage={setProfileImage}
                  adhaarCardFrontImage={adhaarCardFrontImage}
                  setAdhaarCardFrontImage={setAdhaarCardFrontImage}
                  adhaarCardBackImage={adhaarCardBackImage}
                  setAdhaarCardBackImage={setAdhaarCardBackImage}
                  handleContinue={handleSubmit}
                  onBack={handleBack}
                  onClose={handleClose}
                />
              )}
            </div>

            {/* footer actions - responsive */}
            <div className="mt-6 flex flex-col sm:flex-row items-center sm:justify-between gap-3">
              <div className="w-full sm:w-auto flex gap-2">
                <button
                  onClick={handleBack}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  {step > 1 ? 'Back' : 'Cancel'}
                </button>
              </div>

              <div className="w-full sm:w-auto flex gap-2">
                {step < 7 ? (
                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto px-4 py-2 rounded-md bg-[#7D0A0A] text-white hover:bg-[#5c0707]"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full sm:w-auto px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit Profile'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
