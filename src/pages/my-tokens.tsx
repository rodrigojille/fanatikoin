import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';
import { useToken } from '@/context/TokenContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import TokenDashboard from '@/components/token/TokenDashboard';
import MyTokensPieChart from '@/components/MyTokensPieChart';
import { UserToken as AppUserToken, TokenBenefit } from '@/types/token';

const calculateTotalValue = (balance: bigint, price: number): number => {
  return Number(balance) * price;
};

const MyTokens: React.FC = () => {
  const { address, connect, walletError, setWalletError } = useWeb3();
  const { tokens, loading: isLoading, error, fetchTokens } = useToken();
  const { user } = useAuth();

  // Helper: Detect wallet/account states
  const backendWallet = user?.walletAddress;
  const isWalletConnected = !!address;
  const isAccountMatch = isWalletConnected && backendWallet && address.toLowerCase() === backendWallet.toLowerCase();
  const showBackendWalletInfo = !isWalletConnected && backendWallet;
  const showAccountMismatch = isWalletConnected && backendWallet && address.toLowerCase() !== backendWallet.toLowerCase();
  type TabType = 'owned' | 'created' | 'activity';

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const { t } = useTranslation('common');

  // Only show one tab: 'Tokens Propios'
  const singleTabLabel = t('myTokens.ownedTokens', 'Tokens Propios');

  useEffect(() => {
    if (address) {
      fetchTokens();
    }
  }, [address, fetchTokens]);

  const dummyUserTokens: AppUserToken[] = [
    {
      address: '0x1234567890123456789012345678901234567890',
      name: 'FC Barcelona',
      symbol: 'BAR',
      balance: BigInt(100),
      price: 25,
      description: t('auctions.descriptions.barcelona'),
      totalValue: calculateTotalValue(BigInt(100), 25)
    },
    {
      address: '0x2345678901234567890123456789012345678901',
      name: 'Manchester United',
      symbol: 'MUN',
      balance: BigInt(75),
      price: 22,
      description: t('auctions.descriptions.manchester'),
      totalValue: calculateTotalValue(BigInt(75), 22)
    },
    {
      address: '0x3456789012345678901234567890123456789012',
      name: 'Paris Saint-Germain',
      symbol: 'PSG',
      balance: BigInt(50),
      price: 30,
      description: t('auctions.descriptions.psg'),
      totalValue: calculateTotalValue(BigInt(50), 30)
    }
  ];

  // Helper function to safely convert price string to number
  const getPriceAsNumber = (price: string | number): number => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') return parseFloat(price) || 0;
    return 0;
  };

  // Convert string benefits to TokenBenefit objects
  const convertBenefits = (benefits: string[] | undefined): TokenBenefit[] => {
    if (!benefits || benefits.length === 0) return [];
    return benefits.map((benefit, index) => ({
      id: `benefit-${index}`,
      name: benefit,
      description: benefit,
      requiredAmount: 1,
      category: 'other' as const
    }));
  };

  // Use tokens directly; dummyUserTokens only in development
  const { tokensEmpty } = useToken();
  const userTokens: AppUserToken[] = (tokens.length > 0)
    ? tokens.map(token => ({
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        description: token.description || '',
        balance: BigInt(0), // TODO: Get actual balance from contract
        price: getPriceAsNumber(token.price),
        totalValue: calculateTotalValue(BigInt(0), getPriceAsNumber(token.price)),
        benefits: convertBenefits(token.benefits)
      }))
    : (process.env.NODE_ENV === 'development' ? dummyUserTokens : []);

  // Calculate total portfolio value
  const totalPortfolioValue = userTokens.reduce((total, token) => total + Number(token.totalValue), 0);

  return (
    <div>
      {/* No tokens found message */}
      {!isLoading && !error && tokensEmpty && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-xl font-bold mb-2">{t('myTokens.noTokensFound')}</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('myTokens.noTokensMessage')}
          </p>
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 mb-8 shadow-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t('myTokens.title')}</h1>
        <p className="text-gray-700 dark:text-gray-300">
          {t('myTokens.subtitle')}
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="/governance" className="btn-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded px-3 py-1">Governance</Link>
          <Link href="/vote" className="btn-sm bg-green-600 text-white hover:bg-green-700 rounded px-3 py-1">Vote</Link>
          <Link href="/fan-engagement" className="btn-sm bg-blue-600 text-white hover:bg-blue-700 rounded px-3 py-1">{t('fanEngagement.title')}</Link>
        </div>
      </div>

      {/* Single Tab Heading */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="pb-4 px-1 border-b-2 border-primary text-primary font-medium text-lg">
          {singleTabLabel}
        </div>
      </div>

      {isClient && !address && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0zm-1 8a1 1 0 01-1 1v3a1 1 0 002 0v-3a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{t('myTokens.connectWalletPrompt')}</span>
          </div>
          <button
            onClick={connect}
            className="mt-4 bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            {t('common.connectWallet', 'Connect Wallet')}
          </button>
        </div>
      )}
      {isClient && address && (
        <div>
          {/* Pie Chart of Token Values */}
          {userTokens.length > 0 && <MyTokensPieChart tokens={userTokens.map(t => ({ name: t.name, symbol: t.symbol, totalValue: Number(t.totalValue) }))} />}

          {/* Portfolio Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('myTokens.portfolioSummary')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('myTokens.totalValue')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPortfolioValue} CHZ</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('myTokens.uniqueTokens')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userTokens.length}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('myTokens.totalTokens')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userTokens.reduce((total, token) => Number(token.balance) + total, 0)}</p>
              </div>
            </div>
          </div>

          {/* Token Details List */}
          <div className="space-y-6">
            {userTokens.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                {t('myTokens.noTokensFound', 'No tokens found.')}
              </div>
            ) : (
              userTokens.map(token => (
                <div key={token.address} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-xl font-bold text-primary">{token.name}</span>
                        <span className="text-sm text-gray-500">({token.symbol})</span>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 mb-2">{token.description}</div>
                      {token.benefits && token.benefits.length > 0 && (
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-2">
                          {token.benefits.map(benefit => (
                            <li key={benefit.id}>{benefit.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{t('myTokens.balance', 'Balance')}: {token.balance.toString()}</div>
                      <div className="text-sm text-gray-500">{t('myTokens.price', 'Price')}: {token.price} CHZ</div>
                      <div className="text-sm text-gray-500">{t('myTokens.totalValue', 'Total Value')}: {token.totalValue} CHZ</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTokens;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common']))
    }
  };
};
