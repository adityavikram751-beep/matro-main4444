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
  onClose: () => void;            // closes the modal
  onSuccess?: (profileData: any) => void; // optional callback for parent
}





export default function MultiStepForm({ onClose,onSuccess }: MultiStepFormProps) {
  const [step, setStep] = useState(1);
  const [showForm, setShowForm] = useState(true);

  // Step 1 states
  const [profileFor, setProfileFor] = useState('');
  const [FirstName, setFirstName] = useState('');
  const [MiddleName, setMiddleName] = useState('');
  const [LastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [isChildrenLivingWithYou, setIsChildrenLivingWithYou] = useState(false);

  // Step 2 states
  const [religion, setReligion] = useState('');
  const [willingToMarryOtherCaste, setWillingToMarryOtherCaste] = useState<boolean | null>(null);

  const [caste, setCaste] = useState('');
  const [community, setCommunity] = useState('');
  const [gotra, setGotra] = useState('');
  const [motherTongue, setMotherTongue] = useState('');

  // Step 3 states
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [complexion, setComplexion] = useState('');
  const [anyDisability, setAnyDisability] = useState<boolean>(false);

  const [diet, setDiet] = useState('');

  // Step 4 states
  const [familyType, setFamilyType] = useState('');
  const [familyStatus, setFamilyStatus] = useState('');

  // Step 5 states
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [highestEducation, setHighestEducation] = useState('');

  // Step 6 states
  const [employedIn, setEmployedIn] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [designation, setDesignation] = useState('');

  // Step 7 states
  const [profileImage, setProfileImage] = useState<File | string | null>(null);
  const [adhaarCardFrontImage, setAdhaarCardFrontImage] = useState<File | null>(null);
  const [adhaarCardBackImage, setAdhaarCardBackImage] = useState<File | null>(null);

  // ✅ Validation per step
  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!profileFor || !FirstName || !LastName || !dateOfBirth || !gender || !maritalStatus) {
          alert('Please fill all required fields in Step 1');
          return false;
        }
        break;
      case 2:
        if (!religion || !willingToMarryOtherCaste || !motherTongue) {
          alert('Please fill all required fields in Step 2');
          return false;
        }
        break;
      case 3:
        if (!height || !weight || !complexion || !diet) {
          alert('Please fill all required fields in Step 3');
          return false;
        }
        break;
      case 4:
        if (!familyType || !familyStatus) {
          alert('Please fill all required fields in Step 4');
          return false;
        }
        break;
      case 5:
        if (!country || !state || !city || !highestEducation) {
          alert('Please fill all required fields in Step 5');
          return false;
        }
        break;
      case 6:
        if (!employedIn || !annualIncome || !workLocation || !designation) {
          alert('Please fill all required fields in Step 6');
          return false;
        }
        break;
      case 7:
        if (!profileImage || !adhaarCardFrontImage || !adhaarCardBackImage) {
          alert('Please upload all required documents in Step 7');
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  // ✅ Navigation handlers
  const handleNext = () => {
  console.log("✅ Continue clicked, current step:", step);
  if (!validateStep()) {
    console.log("❌ Validation failed at step", step);
    return;
  }
  console.log("✅ Validation passed, going to next step");
  setStep((prev) => prev + 1);
};


  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
    else onClose();
  };

  // ✅ Final Submit
  const handleSubmit = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You must be logged in!');
      return;
    }

    const formDataObj = new FormData();

    // Text fields
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
    formDataObj.append('anyDisability', anyDisability.toString()); // 'true' or 'false'

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

    // Files
    if (profileImage instanceof File) formDataObj.append('profileImage', profileImage);
    if (adhaarCardFrontImage) formDataObj.append('adhaarCardFrontImage', adhaarCardFrontImage);
    if (adhaarCardBackImage) formDataObj.append('adhaarCardBackImage', adhaarCardBackImage);

    try {
      const response = await fetch('https://matrimonial-backend-7ahc.onrender.com/auth/profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });

       if (response.ok) {
  const data = await response.json();
  alert('Profile submitted successfully!');
  console.log('Server response:', data);

  // ✅ notify parent component
  onSuccess?.(data);  

  // close the modal
  onClose();

 
      } else {
        const errorData = await response.json();
        console.error('Submission error:', errorData);
        alert(`Submission failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Something went wrong!');
    }
  };

  return (
  <>
    {showForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-lg p-6 relative overflow-y-auto max-h-[90vh]">

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
    handleContinue={handleNext}   // 👈 pass parent’s function
              onClose={() => {
                setShowForm(false); // 👈 ye local close karega
                onClose();          // 👈 parent ko bhi inform karega
              }}
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
              onClose={() => {
    setShowForm(false);
    onClose();
  }}

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
                          onClose={() => {
    setShowForm(false);
    onClose();
  }}

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
                          onClose={() => {
    setShowForm(false);
    onClose();
  }}

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
                          onClose={() => {
    setShowForm(false);
    onClose();
  }}

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
                          onClose={() => {
    setShowForm(false);
    onClose();
  }}

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
    handleContinue={handleSubmit}   // 👈 corrected
    onBack={handleBack}
                  onClose={() => {
    setShowForm(false);
    onClose();
  }}

  />
)}


      </div>
    </div>
    )}
 
      </>

  );
}
