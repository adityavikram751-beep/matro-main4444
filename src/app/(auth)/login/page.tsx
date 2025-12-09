'use client';

import Level1Form from '@/components/login/Level1';
import { useState } from 'react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');

  return (
    <div className="max-w-md mx-auto p-6">
      <Level1Form
        phoneNumber={phone}
        setPhoneNumber={setPhone}
        onBack={() => window.history.back()}
        handleContinueLevel1={() => {}}
        openSignupModal={() => {}}
        onLoginSuccess={(token, userId) => {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userId', userId);
          window.location.href = '/';
        }}
      />
    </div>
  );
}
