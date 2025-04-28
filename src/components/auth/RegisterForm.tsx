import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RegisterCredentials } from '@/types/auth';
import { useRouter } from 'next/router';

import { useWeb3 } from '@/context/Web3Context';

export const RegisterForm: React.FC = () => {
  const { register, error, loading } = useAuth();
  const { address: walletAddress, isConnected } = useWeb3();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    if (!validateEmail(formData.email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords don't match");
      return;
    }

    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    try {
      // If wallet is connected, register with wallet address
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        ...(isConnected && walletAddress ? { walletAddress } : {})
      };
      await register(payload);
      // Redirect to login after successful registration
      router.push('/login');
    } catch (error) {
      // Error is handled by context
    }
  };



  return (
    <form onSubmit={handleSubmit} role="form" className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      
      {(error || validationError) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error || validationError}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={8}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
          loading
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Creating account...' : 'Register'}
      </button>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            Login here
          </a>
        </p>
      </div>
    </form>
  );
};
