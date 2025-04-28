import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';

const Create = () => {
  const router = useRouter();
  const { isConnected, connect, account, isChilizChain } = useWeb3();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Check if user has permission to access this page
  useEffect(() => {
    if (isAuthenticated && user && !(user.isAdmin || user.isTeam)) {
      // If user is logged in but not an admin or team, redirect to home
      router.push('/');
    }
  }, [user, isAuthenticated, router]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    supply: '',
    price: '',
    benefits: ['', '', ''],
    teamVerified: false
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle benefit input changes
  const handleBenefitChange = (index: number, value: string) => {
    const updatedBenefits = [...formData.benefits];
    updatedBenefits[index] = value;
    setFormData({
      ...formData,
      benefits: updatedBenefits
    });
  };

  // Add new benefit field
  const addBenefit = () => {
    setFormData({
      ...formData,
      benefits: [...formData.benefits, '']
    });
  };

  // Remove benefit field
  const removeBenefit = (index: number) => {
    const updatedBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      benefits: updatedBenefits
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      connect();
      return;
    }

    // Verify user has permission to create tokens
    if (!user || !(user.isAdmin || user.isTeam)) {
      setError('You do not have permission to create tokens. Only team representatives and admins can create tokens.');
      return;
    }

    // Validate form
    if (!formData.name || !formData.symbol || !formData.description || !formData.supply || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isChilizChain) {
      setError('Please connect to the Chiliz blockchain to create tokens');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // In a real app, this would call a smart contract function to create the token
      // For demo purposes, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Creation successful
      setSuccess(true);
      
      // Reset form after showing success message
      setTimeout(() => {
        router.push('/my-tokens');
      }, 3000);
    } catch (err) {
      console.error('Token creation failed:', err);
      setError('Token creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-secondary text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Team Token</h1>
        <p className="text-gray-300">
          Create and mint new team tokens on the Chiliz blockchain
        </p>
      </div>

      {!isConnected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div>
              <p className="font-bold">Connect your wallet to create tokens</p>
              <p className="text-sm">You need to connect your wallet to create and mint team tokens.</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={connect}
                className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {isConnected && !isChilizChain && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div>
              <p className="font-bold">Wrong Network</p>
              <p className="text-sm">Please switch to the Chiliz blockchain to create tokens.</p>
            </div>
          </div>
        </div>
      )}

      {success ? (
        <div className="bg-green-100 text-green-700 p-6 rounded-md mb-8 text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
          </svg>
          <h3 className="text-xl font-bold mb-2">Token Created Successfully!</h3>
          <p className="mb-4">Your team token has been created and minted on the Chiliz blockchain.</p>
          <p className="text-sm">Redirecting to your tokens...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Token Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. FC Barcelona Fan Token"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Token Symbol *
              </label>
              <input
                type="text"
                id="symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                placeholder="e.g. BAR"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                maxLength={5}
              />
              <p className="text-xs text-gray-500 mt-1">Maximum 5 characters</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your team token and its benefits"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="supply" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Supply *
              </label>
              <input
                type="number"
                id="supply"
                name="supply"
                value={formData.supply}
                onChange={handleInputChange}
                placeholder="e.g. 1000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                min="1"
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initial Price (CHZ) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g. 10"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                min="0.1"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Token Benefits
            </label>
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  placeholder={`Benefit ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {formData.benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addBenefit}
              className="text-primary hover:text-red-700 flex items-center mt-2"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Benefit
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="teamVerified"
                name="teamVerified"
                checked={formData.teamVerified}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="teamVerified" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I confirm that I am an authorized representative of this team
              </label>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || (!isConnected || (isConnected && !isChilizChain))}
            className={`w-full btn-primary ${(isLoading || (!isConnected || (isConnected && !isChilizChain))) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Token...
              </span>
            ) : !isConnected ? 'Connect Wallet to Create Token' : !isChilizChain ? 'Switch to Chiliz Network' : 'Create Token'}
          </button>
        </form>
      )}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    },
  };
};

export default Create;
