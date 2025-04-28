import React from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/context/AuthContext';
import { useWeb3 } from '@/context/Web3Context';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/Layout';
import Image from 'next/image';
import { useToken } from '@/context/TokenContext';
import FanEngagement from '@/components/staking/FanEngagement';
import { UserToken } from '@/types/token';

import { useRouter } from 'next/router';

const Team = () => {
  const { address, connect } = useWeb3();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { tokens, loading, error } = useToken();
  const userTokens: UserToken[] = tokens.map(token => ({
    address: token.address,
    name: token.name,
    symbol: token.symbol,
    description: token.description || '',
    balance: 'balance' in token ? (typeof (token as any).balance === 'bigint' ? (token as any).balance : BigInt((token as any).balance ?? 0)) : 0n,
    price: typeof token.price === 'number' ? token.price : Number(token.price ?? 0),
    totalValue: 'totalValue' in token ? (typeof (token as any).totalValue === 'number' ? (token as any).totalValue : Number((token as any).totalValue ?? 0)) : 0,
    imageUrl: 'imageUrl' in token ? (token as any).imageUrl : undefined,
    teamId: 'teamId' in token ? (token as any).teamId : undefined,
    votingPower: 'votingPower' in token ? (token as any).votingPower : undefined,
    voteParticipation: 'voteParticipation' in token ? (token as any).voteParticipation : undefined,
    lastDistribution: 'lastDistribution' in token ? (token as any).lastDistribution : undefined,
    benefits: Array.isArray(token.benefits)
      ? (token.benefits as any[]).map((b, idx) => typeof b === 'string'
          ? { id: `benefit-${idx}`, name: b, description: b, requiredAmount: 1, category: 'other' }
          : b)
      : [],
  }));
  const router = useRouter();

  React.useEffect(() => {
    // Only allow 'team' or 'admin' role
    if (!user || !user.role || (user.role !== 'team' && user.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, router]);

  // While checking/redirecting, render nothing for unauthorized users
  if (!user || !user.role || (user.role !== 'team' && user.role !== 'admin')) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {!address && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0zm-1 8a1 1 0 01-1 1v3a1 1 0 002 0v-3a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>{t('team.connectWalletPrompt', 'Please connect your wallet to manage your team')}</span>
              <button
                onClick={connect}
                className="ml-4 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
              >
                {t('connect.connectWallet', 'Connect Wallet')}
              </button>
            </div>
          </div>
        )}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('team.title', 'Team Token Management')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A dedicated group of professionals working to revolutionize sports fan engagement through blockchain technology
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community First</h3>
              <p className="text-gray-600 dark:text-gray-300">Building strong connections between fans and teams</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trust & Security</h3>
              <p className="text-gray-600 dark:text-gray-300">Ensuring safe and transparent transactions</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300">Pushing the boundaries of fan engagement</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-6">{t('team.title', 'Team Token Management')}</h1>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-indigo-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900">{t('team.totalTokens', 'Total Tokens')}</h3>
                <p className="text-2xl font-bold text-indigo-600">{tokens.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900">{t('team.totalHolders', 'Total Holders')}</h3>
                <p className="text-2xl font-bold text-green-600">
                  'N/A'
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900">{t('team.activeAuctions', 'Active Auctions')}</h3>
                <p className="text-2xl font-bold text-purple-600">0</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-semibold">{t('team.yourTokens', 'Your Tokens')}</h2>
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : tokens.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {tokens.map((token) => (
                      null // <TokenStats ... /> placeholder, returns null for now
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">{t('team.noTokens', 'No tokens created yet')}</p>
                  </div>
                )}
              </div>

              <div>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('team.fanEngagementManagement', 'Fan Engagement Management')}</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{t('team.fanEngagementDesc', 'Manage fan challenges, rewards, and engagement activities for your team.')}</p>
                  {/* FanEngagement component for team management */}
                  {/* Pass a dummy token or select from team tokens if available */}
                  <FanEngagement token={userTokens[0] || {address: '', name: '', symbol: '', balance: 0n, price: 0, description: '', totalValue: 0}} onUpdate={() => {}} />
                  <div className="flex flex-wrap gap-4 mt-6">
                    <a href="/team/create-reward" className="btn-primary px-4 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700">{t('team.createReward', 'Create New Reward')}</a>
                    <a href="/team/manage-challenges" className="btn-primary px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700">{t('team.manageChallenges', 'Manage Challenges')}</a>
                    <a href="/team/analytics" className="btn-primary px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700">{t('team.analyticsTitle', 'Analytics')}</a>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('team.rewardsManagement', 'Rewards & Engagement')}</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{t('team.rewardsDesc', 'Create and manage fan rewards, exclusive experiences, and engagement campaigns.')}</p>
                  {/* Placeholder for rewards management UI */}
                  <div className="flex flex-col gap-4">
                    <button className="btn-primary w-full">{t('team.createReward', 'Create New Reward')}</button>
                    <button className="btn-secondary w-full">{t('team.manageChallenges', 'Manage Challenges')}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    },
  };
};

export default Team;
