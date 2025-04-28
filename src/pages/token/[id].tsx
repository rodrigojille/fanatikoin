"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/context/Web3Context';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, GetStaticPaths } from 'next';
import Layout from '@/components/Layout';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

// Mock data - in a real app, this would come from an API or blockchain
const mockTokens = {
  '1': {
    id: 1,
    name: 'FC Barcelona',
    symbol: 'BAR',
    price: 25,
    image: '/images/teams/barcelona-token.svg',
    supply: 1000000,
    available: 750000,
    description: 'Official fan token for FC Barcelona. Holders can vote on club decisions, access exclusive content, and receive special perks.',
    benefits: [
      'voteOnClubDecisions',
      'accessToExclusiveContent',
      'merchandiseDiscounts',
      'chanceToWinMatchTickets'
    ]
  },
  '2': {
    id: 2,
    name: 'Manchester United',
    symbol: 'MUN',
    price: 22,
    image: '/images/teams/manchester-token.svg',
    supply: 1000000,
    available: 800000,
    description: 'Official fan token for Manchester United. Holders can vote on club decisions, access exclusive content, and receive special perks.',
    benefits: [
      'voteOnClubDecisions',
      'accessToExclusiveContent',
      'merchandiseDiscounts',
      'chanceToWinMatchTickets'
    ]
  },
  '3': {
    id: 3,
    name: 'Juventus',
    symbol: 'JUV',
    price: 20,
    image: '/images/teams/juventus-token.svg',
    supply: 1000000,
    available: 600000,
    description: 'Official fan token for Juventus. Holders can vote on club decisions, access exclusive content, and receive special perks.',
    benefits: [
      'voteOnClubDecisions',
      'accessToExclusiveContent',
      'merchandiseDiscounts',
      'chanceToWinMatchTickets'
    ]
  },
  '4': {
    id: 4,
    name: 'Paris Saint-Germain',
    symbol: 'PSG',
    price: 23,
    image: '/images/teams/psg-token.svg',
    supply: 1000000,
    available: 700000,
    description: 'Official fan token for Paris Saint-Germain. Holders can vote on club decisions, access exclusive content, and receive special perks.',
    benefits: [
      'voteOnClubDecisions',
      'accessToExclusiveContent',
      'merchandiseDiscounts',
      'chanceToWinMatchTickets'
    ]
  },
  '5': {
    id: 5,
    name: 'Manchester City',
    symbol: 'MCI',
    price: 24,
    image: '/images/teams/mancity-token.svg',
    supply: 1000000,
    available: 650000,
    description: 'Official fan token for Manchester City. Holders can vote on club decisions, access exclusive content, and receive special perks.',
    benefits: [
      'voteOnClubDecisions',
      'accessToExclusiveContent',
      'merchandiseDiscounts',
      'chanceToWinMatchTickets'
    ]
  },
  '6': {
    id: 6,
    name: 'Club América',
    symbol: 'AME',
    price: 18,
    image: '/images/teams/america-token.svg',
    supply: 800000,
    available: 500000,
    description: 'Official fan token for Club América. Holders can vote on club decisions, access exclusive content, and receive special perks.',
    benefits: [
      'voteOnClubDecisions',
      'accessToExclusiveContent',
      'merchandiseDiscounts',
      'chanceToWinMatchTickets'
    ]
  },
  '7': {
    id: 7,
    name: 'Chivas Guadalajara',
    symbol: 'CHV',
    price: 17,
    image: '/images/teams/chivas-token.svg',
    supply: 800000,
    available: 550000,
    description: 'Official fan token for Chivas Guadalajara. Holders can vote on club decisions, access exclusive content, and receive special perks.',
    benefits: [
      'voteOnClubDecisions',
      'accessToExclusiveContent',
      'merchandiseDiscounts',
      'chanceToWinMatchTickets'
    ]
  },
  '8': {
    id: 8,
    name: 'Diablos Rojos',
    symbol: 'DRB',
    price: 15,
    image: '/images/teams/diablos-token.svg',
    supply: 500000,
    available: 350000,
    description: 'Official fan token for Diablos Rojos baseball team. Holders can vote on team decisions, access exclusive content, and receive special perks.',
    benefits: [
      'voteOnTeamDecisions',
      'accessToExclusiveContent',
      'merchandiseDiscounts',
      'chanceToWinGameTickets'
    ]
  },
  '9': {
    id: 9,
    name: 'Toros de Tijuana',
    symbol: 'TTJ',
    price: 16,
    image: '/images/teams/toros-token.svg',
    supply: 500000,
    available: 300000,
    description: 'Official fan token for Toros de Tijuana baseball team. Holders can vote on team decisions, access exclusive content, and receive special perks.',
    benefits: [
      'voteOnTeamDecisions',
      'accessToExclusiveContent',
      'merchandiseDiscounts',
      'chanceToWinGameTickets'
    ]
  }
};

const TokenDetail = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  const { connect, address, isConnecting } = useWeb3();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Get token data based on ID
  const token = id ? mockTokens[id as string] : null;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handlePurchase = async () => {
    if (!address) {
      connect();
      return;
    }

    if (quantity <= 0) {
      toast.error(t('token.purchase.error.invalidQuantity', 'Please enter a valid quantity'));
      return;
    }

    setIsLoading(true);
    
    try {
      // In a real app, this would call a smart contract function
      // For demo purposes, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Purchase successful
      setPurchaseSuccess(true);
      
      // Reset after showing success message
      setTimeout(() => {
        setPurchaseSuccess(false);
        setQuantity(1);
      }, 3000);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading token details...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Token Image */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex items-center justify-center relative aspect-square">
        <Image
          src={token.image}
          alt={token.name}
          fill
          style={{ objectFit: 'contain' }}
          className="p-8"
        />
      </div>

      {/* Token Details */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{token.name}</h1>
          <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
            {token.symbol}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">{token.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>{t('token.labels.available')}</span>
            <span>{Math.round(token.available / 1000)}K / {Math.round(token.supply / 1000)}K</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${(token.available / token.supply) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">{t('token.benefits.title')}</h3>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
            {token.benefits.map((benefit, index) => (
              <li key={index}>{t(`token.benefits.${benefit}`)}</li>
            ))}
          </ul>
        </div>

        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('token.labels.pricePerToken')}</p>
              <p className="text-2xl font-bold">{token.price} CHZ</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('token.labels.total')}</p>
              <p className="text-2xl font-bold">{token.price * quantity} CHZ</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <label htmlFor="quantity" className="text-gray-600 dark:text-gray-400">
              {t('token.labels.quantity')}
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {purchaseSuccess ? (
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
              {t('token.purchase.success', { quantity, symbol: token.symbol })}
            </div>
          ) : null}

          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className={`w-full btn-primary ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('token.labels.processing')}
              </span>
            ) : !address ? t('token.purchase.connectWallet') : t('token.purchase.buyTokens', { quantity, symbol: token.symbol })}
          </button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>{t('token.purchase.disclaimer.chiliz')}</p>
          <p>{t('token.purchase.disclaimer.network')}</p>
        </div>
      </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const locales = ['en', 'es'];
  const paths = Object.keys(mockTokens).flatMap((id) =>
    locales.map((locale) => ({
      params: { id },
      locale
    }))
  );

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    }
  };
};

export default TokenDetail;
