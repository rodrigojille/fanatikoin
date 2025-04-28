"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';
import { useTokenAuction } from '../hooks/useTokenAuction';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';

interface AppAuction {

  address: string;
  name: string;
  symbol: string;
  currentBid: number;
  minBidIncrement: number;
  endTime: string;
  description: string;
  totalBids: number;
}

const Auctions = () => {
  const { address, connect } = useWeb3();
  const { auctions, loading, error } = useTokenAuction();
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('ending-soon');

  // No need to fetchAuctions, auctions are loaded by the hook itself
  // useEffect(() => {
  //   fetchAuctions();
  // }, []);



  // Format time remaining
  const formatTimeRemaining = (endTimeStr: string) => {
    const endTime = new Date(endTimeStr).getTime();
    const now = Date.now();
    const diff = endTime - now;
    
    if (diff <= 0) return t('auctions.ended');
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}${t('auctions.timeFormat.days')} ${hours}${t('auctions.timeFormat.hours')}`;
    } else if (hours > 0) {
      return `${hours}${t('auctions.timeFormat.hours')} ${minutes}${t('auctions.timeFormat.minutes')}`;
    } else {
      return `${minutes}${t('auctions.timeFormat.minutes')}`;
    }
  };

  // Get translated description based on token type
  const getTranslatedDescription = (symbol: string) => {
    // First try the full symbol
    const fullSymbolDesc = t(`auctions.descriptions.${symbol.toLowerCase()}`);
    if (fullSymbolDesc !== `auctions.descriptions.${symbol.toLowerCase()}`) {
      return fullSymbolDesc;
    }

    // If no translation found, return the default description
    return t('auctions.defaultDescription');
  };


    // Helper: check if object is an AppAuction
  const isAuction = (item: any): item is AppAuction => {
    return (
      item &&
      typeof item.address === 'string' &&
      typeof item.name === 'string' &&
      typeof item.symbol === 'string' &&
      typeof item.currentBid === 'number' &&
      typeof item.endTime === 'string'
    );
  };

  // Helper: check if auction has a valid endTime
  const hasEndTime = (item: any): boolean => {
    return !!(item && typeof item.endTime === 'string');
  };

  // Safe getter functions for properties that might not exist
  const getEndTime = (item: any): string => {
    return hasEndTime(item) ? item.endTime : new Date(Date.now() + 86400000).toISOString(); // Default to 24h from now
  };
  
  const getCurrentBid = (item: any): string => {
    return isAuction(item) ? item.currentBid.toString() : '0';
  };
  
  const getTotalBids = (item: any): number => {
    return isAuction(item) ? item.totalBids : 0;
  };


  // Normalize auctions to AppAuction shape for consistent rendering
  const normalizedAuctions: AppAuction[] = auctions.map((auction: any) => ({
    address: auction.address || auction.tokenAddress || '',
    name: auction.name || auction.tokenName || '',
    symbol: auction.symbol || auction.tokenSymbol || '',
    currentBid: typeof auction.currentBid === 'number' ? auction.currentBid : (auction.highestBid ?? 0),
    minBidIncrement: auction.minBidIncrement ?? 1,
    endTime: typeof auction.endTime === 'string' ? auction.endTime : (auction.endTime ? new Date(auction.endTime).toISOString() : new Date(Date.now() + 86400000).toISOString()),
    description: auction.description || '',
    totalBids: typeof auction.totalBids === 'number' ? auction.totalBids : (auction.bids ? auction.bids.length : 0),
  }));

  // Define auctionsEmpty for empty state handling
  const auctionsEmpty = Array.isArray(auctions) && auctions.length === 0;

  // Filter and sort auctions based on user selections
  const filteredAuctions = normalizedAuctions
    .filter(auction => {
      return auction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             auction.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'highest-bid':
          return b.currentBid - a.currentBid;
        case 'most-bids':
          return b.totalBids - a.totalBids;
        case 'ending-soon':
          const aEndTime = new Date(getEndTime(a)).getTime();
          const bEndTime = new Date(getEndTime(b)).getTime();
          return aEndTime - bEndTime;
        default:
          return 0;
      }
    });

  return (
    <div>
      <div className="bg-secondary text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('auctions.title')}</h1>
        <p className="text-gray-300">
          {t('auctions.subtitle')}
        </p>
      </div>
      {/* Connect Wallet Banner */}
      {!address && (
        <div className="bg-primary text-white rounded-xl p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('auctions.connectWalletTitle')}</h2>
          <p className="mb-6">{t('auctions.connectWalletDescription')}</p>
          <button onClick={connect} className="btn-secondary">
            {t('common.connectWallet')}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">{t('auctions.loadingAuctions')}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder={t('auctions.searchAuctions')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="ending-soon">{t('auctions.endingSoon')}</option>
            <option value="highest-bid">{t('auctions.highestBid')}</option>
            <option value="most-bids">{t('auctions.mostBids')}</option>
          </select>
        </div>
      </div>

      {/* Auctions Grid */}
      {!loading && !error && filteredAuctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAuctions.map((auction) => {
              // Map legacy auction type fields to AppAuction fields if necessary
              const address = (auction as any).address || (auction as any).tokenAddress || '';
              const name = (auction as any).name || (auction as any).tokenName || '';
              const symbol = (auction as any).symbol || (auction as any).tokenSymbol || '';
              return (
                <div key={address} className="card hover:shadow-lg transition-shadow">
                  <div className="bg-[#1a1a1a] h-48 rounded-t-lg flex items-center justify-center relative overflow-hidden p-4">
                    <div className="text-4xl font-bold text-primary">{symbol}</div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold">{name}</h3>
                      <div className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                        {t('auctions.endsIn')} {formatTimeRemaining(getEndTime(auction))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                      {getTranslatedDescription(symbol)}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('auctions.currentBid')}</p>
                        <p className="text-xl font-bold">{getCurrentBid(auction)} CHZ</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('auctions.totalBids')}</p>
                        <p className="text-lg font-semibold">{getTotalBids(auction)}</p>
                      </div>
                    </div>
                    <Link href={`/auction/${address}`} className="btn-primary w-full">
                      {t('auctions.viewAuction')}
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        (!loading && !error && auctionsEmpty) ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-xl font-bold mb-2">{t('auctions.noAuctionsFound')}</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('auctions.tryAdjustingYourSearchCriteria')}
            </p>
          </div>
        ) : null
      )}
    </div>
  );
};

export default Auctions;

export const getServerSideProps: GetServerSideProps = async ({ locale = 'en' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    }
  };
}
