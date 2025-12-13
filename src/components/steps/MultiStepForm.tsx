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
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- STATE ---------------- */
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
  const [willingToMarryOtherCaste, setWillingToMarryOtherCaste] =
    useState<boolean | null>(null);
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

  /* ---------------- NAVIGATION ---------------- */
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onClose();
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (submitting) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Login required');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('profileFor', profileFor);
    formData.append('FirstName', FirstName);
    formData.append('MiddleName', MiddleName);
    formData.append('LastName', LastName);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('gender', gender);
    formData.append('maritalStatus', maritalStatus);
    formData.append('numberOfChildren', numberOfChildren.toString());
    formData.append('isChildrenLivingWithYou', String(isChildrenLivingWithYou));

    formData.append('religion', religion);
    formData.append('willingToMarryOtherCaste', String(willingToMarryOtherCaste));
    formData.append('caste', caste);
    formData.append('community', community);
    formData.append('gotra', gotra);
    formData.append('motherTongue', motherTongue);

    formData.append('height', height);
    formData.append('weight', weight);
    formData.append('complexion', complexion);
    formData.append('anyDisability', String(anyDisability));
    formData.append('diet', diet);

    formData.append('familyType', familyType);
    formData.append('familyStatus', familyStatus);

    formData.append('country', country);
    formData.append('state', state);
    formData.append('city', city);
    formData.append('highestEducation', highestEducation);

    formData.append('employedIn', employedIn);
    formData.append('annualIncome', annualIncome);
    formData.append('workLocation', workLocation);
    formData.append('designation', designation);

    if (profileImage instanceof File) formData.append('profileImage', profileImage);
    if (adhaarCardFrontImage) formData.append('adhaarCardFrontImage', adhaarCardFrontImage);
    if (adhaarCardBackImage) formData.append('adhaarCardBackImage', adhaarCardBackImage);

    try {
      const res = await fetch(
        'https://matrimonial-backend-7ahc.onrender.com/auth/profile',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');

      alert('Profile submitted successfully');
      onSuccess?.(data);
      onClose();
    } catch (e: any) {
      alert(e.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl mx-4 rounded-xl shadow-lg max-h-[92vh] overflow-y-auto">

        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Create Profile</h2>
            <p className="text-sm text-gray-500">Step {step} of 7</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Back
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 text-sm text-red-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-6">
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
              handleContinue={() => setStep(2)}
              onClose={onClose}
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
              handleContinue={() => setStep(3)}
              onBack={handleBack}
              onClose={onClose}
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
              handleContinue={() => setStep(4)}
              onBack={handleBack}
              onClose={onClose}
            />
          )}

          {step === 4 && (
            <Step4Form
              familyType={familyType}
              setFamilyType={setFamilyType}
              familyStatus={familyStatus}
              setFamilyStatus={setFamilyStatus}
              handleContinue={() => setStep(5)}
              onBack={handleBack}
              onClose={onClose}
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
              handleContinue={() => setStep(6)}
              onBack={handleBack}
              onClose={onClose}
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
              handleContinue={() => setStep(7)}
              onBack={handleBack}
              onClose={onClose}
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
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
