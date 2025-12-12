'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type Follow2FormProps = {
  otp: string;
  setOtp: (value: string) => void;
  onBack: () => void;
  phoneNumber: string;
  setIsProfileSetupOpen: (value: boolean) => void;
  closeModal: () => void;
  onSignupSuccess: (token: string, userId?: string) => void;
};

const Follow2Form = ({
  otp,
  setOtp,
  onBack,
  phoneNumber,
  setIsProfileSetupOpen,
  closeModal,
  onSignupSuccess,
}: Follow2FormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyOtp = async () => {
    if (otp.length !== 4) return;

    setIsLoading(true);
    setError('');

    try {
      // 🔥 Test shortcut mode
      if (otp === '1234') {
        toast.success('OTP verified successfully! (Test mode)');

        // Pass fake token + null userId
        onSignupSuccess('FAKE_TOKEN', null);

        closeModal();
        return;
      }

      const response = await fetch(
        'https://matrimonial-backend-7ahc.onrender.com/auth/verify-otp-register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: phoneNumber, otp }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('OTP verified successfully!');

        localStorage.setItem('authToken', data.token);

        // Notify parent
        onSignupSuccess(data.token, data.userId);

        // Close OTP Modal
        closeModal();
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        toast.error('Verification failed');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Failed to verify OTP. Please try again.');
      toast.error('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      toast.success('OTP has been resent.');
    } catch (err) {
      console.error('Error resending OTP:', err);
      toast.error('Failed to resend OTP');
    }
  };

  const maskedNumber =
    phoneNumber?.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2') ?? 'your phone number';

  return (
    <>
      <button onClick={onBack} className="mb-3">
        <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-rose-600 transition-colors" />
      </button>

      <div className="flex flex-col items-center justify-center gap-2 mb-6">
        <h2 className="text-xl font-Lato text-gray-900">LOGO</h2>
        <p className="text-xl font-Lato text-gray-900">OTP VERIFICATION</p>
        <p className="text-sm font-Lato text-gray-700">
          We have sent the OTP to {maskedNumber}
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-center">
          <InputOTP maxLength={4} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSeparator />
              <InputOTPSlot index={1} />
              <InputOTPSeparator />
              <InputOTPSlot index={2} />
              <InputOTPSeparator />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6 font-Montserrat text-center">
        Didn't receive OTP?{' '}
        <button
          type="button"
          onClick={handleResendOtp}
          className="text-rose-700 font-medium hover:underline"
        >
          Resend
        </button>
      </p>

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}

      <Button
        onClick={verifyOtp}
        disabled={otp.length !== 4 || isLoading}
        className="w-full bg-[#7D0A0A] hover:bg-[#9e0e0e]"
        size="lg"
      >
        {isLoading ? 'Verifying...' : 'Verify'}
      </Button>
    </>
  );
};

Follow2Form.propTypes = {
  phoneNumber: PropTypes.string.isRequired,
  otp: PropTypes.string.isRequired,
  setOtp: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  setIsProfileSetupOpen: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  onSignupSuccess: PropTypes.func.isRequired,
};

export default Follow2Form;
