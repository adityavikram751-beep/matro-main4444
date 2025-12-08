'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

type Follow1FormProps = {


profileFor?: string;
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



const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate 10-digit phone number
const isValidPhoneNumber = (number: string) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(number);
};

const Follow1Form = ({
 
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
}: Follow1FormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to handle registration API call
const handleRegister = async () => {
  // Check required fields
  if (!firstName.trim() || !lastName.trim() || !mobileNumber.trim()) {
    setError('Please fill in all required fields');
    return;
  }

  // Validate phone number
  if (!isValidPhoneNumber(mobileNumber)) {
    setError('Please enter a valid 10-digit mobile number');
    return;
  }

  // Validate email (only if email is entered)
  if (email && !isValidEmail(email)) {
    setError('Please enter a valid email address');
    return;
  }

  // Reset error and proceed with API call
  setIsLoading(true);
  setError('');

  try {
    const requestBody = {
      firstName,
      lastName,
      email,
      mobile: mobileNumber,
    };

    console.log('Sending registration request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      'https://matrimonial-backend-7ahc.onrender.com/auth/otp-request',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      if (data.token) localStorage.setItem('authToken', data.token);
      handleContinueFollow2();
    } else {
      setError(data.message || 'Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Registration error:', error);
    setError('Network error. Please try again.');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <>
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={onBack}>
          <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-rose-600 transition-colors" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Register</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {/* First Name */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            First Name *
          </Label>
          <Input
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-white"
            required
            disabled={isLoading}
          />
        </div>

        {/* Last Name */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Last Name *
          </Label>
          <Input
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-white"
            required
            disabled={isLoading}
          />
        </div>

        {/* Email */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Email
          </Label>
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white"
            disabled={isLoading}
          />
        </div>

        {/* Mobile */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Mobile Number *
          </Label>
          <Input
            placeholder="Enter your mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="w-full bg-white"
            required
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleRegister}
          className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register Now'}
        </Button>
      </div>
    </>
  );
};

Follow1Form.propTypes = {
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

export default Follow1Form;
