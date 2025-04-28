"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWeb3 } from '../context/Web3Context';
import { useToken } from '../context/TokenContext';
import Layout from '../components/Layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

interface Token {
  id?: number;
  address: string;
  name: string;
  symbol: string;
  price: number;
  description?: string;
  benefits?: string[];
  image?: string;
  supply?: number;
  available?: number;
}

const categoryMap: Record<string, string[]> = {
  'football': [
    'FC Barcelona Token',
    'Manchester United Token',
    'Real Madrid Token',
    'Paris Saint-Germain Token'
  ],
  'baseball': [
    'New York Yankees Token',
    'Boston Red Sox Token'
  ],
  'basketball': [
    'LA Lakers Token',
    'Chicago Bulls Token'
  ]
};

import { useTokenMarketplace } from '../hooks/useTokenMarketplace';

const Marketplace = () => {
  const { t } = useTranslation('common');
  const { address, connect, isConnecting } = useWeb3();
  const { buyTokens, getMarketplaceListings, tokens, loading, error } = useTokenMarketplace();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('price-high');
  const [filterCategory, setFilterCategory] = useState('all');
  const [buyingToken, setBuyingToken] = useState<string | null>(null);

  useEffect(() => {
    getMarketplaceListings();
  }, [getMarketplaceListings]);

  // Filter and sort tokens
  const filteredTokens = tokens
    .filter(token => {
      // Filter by search term
      if (searchTerm && !token.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !token.symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (filterCategory !== 'all') {
        const categoryTokens = categoryMap[filterCategory] || [];
        if (!categoryTokens.includes(token.name)) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'name-a':
          return a.name.localeCompare(b.name);
        case 'name-z':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  // Buy token handler
  const handleBuy = async (tokenAddress: string) => {
    setBuyingToken(tokenAddress);
    try {
      await buyTokens(tokenAddress, 1); // Default to buying 1 token for demo
      alert('Purchase successful!');
    } catch (err) {
      alert('Purchase failed: ' + (err instanceof Error ? err.message : err));
    } finally {
      setBuyingToken(null);
    }
  };

  return (
    <Layout>
      <div className="bg-secondary text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('marketplace.title')}</h1>
        <p className="text-gray-300">
          {t('marketplace.subtitle')}
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t('marketplace.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        
        <div>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">{t('marketplace.filters.allCategories')}</option>
            <option value="football">{t('marketplace.filters.football')}</option>
            <option value="basketball">{t('marketplace.filters.basketball')}</option>
            <option value="baseball">{t('marketplace.filters.baseball')}</option>
          </select>
        </div>
        
        <div>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="price-high">{t('marketplace.sort.priceHighToLow')}</option>
            <option value="price-low">{t('marketplace.sort.priceLowToHigh')}</option>
            <option value="name-a">{t('marketplace.sort.nameAtoZ')}</option>
            <option value="name-z">{t('marketplace.sort.nameZtoA')}</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">{t('marketplace.loadingTokens')}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Token Grid */}
      {!loading && !error && filteredTokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTokens.map((token) => (
            <div key={token.address} className="card hover:shadow-lg transition-shadow">
              <div className="bg-[#1a1a1a] h-48 rounded-t-lg flex items-center justify-center relative overflow-hidden p-4">
                <div className="text-4xl font-bold text-primary">{token.symbol}</div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{token.name}</h3>
                  <div className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                    {token.symbol}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {token.description || 'No description available'}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                    <p className="text-xl font-bold">{token.price} CHZ</p>
                  </div>
                  <button
                    className="btn-primary px-4 py-2 rounded disabled:opacity-60"
                    disabled={buyingToken === token.address || !address}
                    onClick={() => handleBuy(token.address)}
                  >
                    {buyingToken === token.address ? t('marketplace.buying') : t('marketplace.buy')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        (!loading && !error && tokens.length === 0) ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-xl font-bold mb-2">{t('marketplace.noTokens.title')}</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('marketplace.noTokens.message')}
            </p>
          </div>
        ) : null
      )}
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    },
  };
};

export default Marketplace;
