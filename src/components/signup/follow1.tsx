'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

type Follow1FormProps = {
  profileFor?: string; // optional - who profile is for (self/son/daughter etc.)
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  mobileNumber: string;
  setMobileNumber: (value: string) => void;
  onBack: () => void;
  handleContinueFollow2: () => void;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhoneNumber = (number: string) => /^\d{10}$/.test(number);

export default function Follow1Form({
  profileFor,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  mobileNumber,
  setMobileNumber,
  onBack,
  handleContinueFollow2,
}: Follow1FormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // sanitize numeric input for mobile and limit to 10 digits
  const handleMobileChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digits);
  };

  const handleRegister = async () => {
    // client-side validations
    if (!firstName.trim() || !lastName.trim() || !mobileNumber.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isValidPhoneNumber(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (email && !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        mobile: mobileNumber,
        profileFor: profileFor || undefined,
      };

      // debug log - optional (remove in prod)
      // console.log('Register payload', payload);

      const res = await fetch('https://matrimonial-backend-7ahc.onrender.com/auth/otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // store token if returned (some flows return token)
        if (data.token) localStorage.setItem('authToken', data.token);

        // Move to next step
        handleContinueFollow2();
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={onBack}
          type="button"
          aria-label="Back"
          className="p-1 rounded hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">Create profile</h2>
          {profileFor && <p className="text-sm text-gray-500">Profile for: {profileFor}</p>}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {/* First Name */}
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">First Name *</Label>
          <Input
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading}
            className="bg-white"
            aria-label="First name"
          />
        </div>

        {/* Last Name */}
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">Last Name *</Label>
          <Input
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isLoading}
            className="bg-white"
            aria-label="Last name"
          />
        </div>

        {/* Email */}
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">Email</Label>
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="bg-white"
            aria-label="Email"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">Mobile Number *</Label>
          <Input
            placeholder="Enter your mobile number"
            value={mobileNumber}
            onChange={(e) => handleMobileChange(e.target.value)}
            disabled={isLoading}
            className="bg-white"
            aria-label="Mobile number"
          />
          <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number (numbers only)</p>
        </div>

        <Button
          onClick={handleRegister}
          disabled={isLoading}
          size="lg"
          className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 font-medium text-base shadow transition-all"
        >
          {isLoading ? 'Registering...' : 'Register Now'}
        </Button>
      </div>
    </>
  );
}

// PropTypes for runtime validation (helps JS consumers)
Follow1Form.propTypes = {
  profileFor: PropTypes.string,
  firstName: PropTypes.string.isRequired,
  setFirstName: PropTypes.func.isRequired,
  lastName: PropTypes.string.isRequired,
  setLastName: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  mobileNumber: PropTypes.string.isRequired,
  setMobileNumber: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  handleContinueFollow2: PropTypes.func.isRequired,
};
