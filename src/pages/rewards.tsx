import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import rewardsService, { REWARD_TIERS } from '@/services/rewardsService';
import { Reward, RewardHistory, UserRewards } from '@/types/rewards';
import { NotificationType } from '@/types/notification';
import { showToast } from '@/components/notifications/ToastContainer';

const RewardsPage: NextPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [activeTab, setActiveTab] = useState<'rewards' | 'history' | 'tiers'>('rewards');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=rewards');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?._id) {
      const rewards = rewardsService.getUserRewards(user._id);
      setUserRewards(rewards);
    }
  }, [user]);

  const handleClaimReward = (rewardId: string) => {
    if (!user?._id) return;
    
    try {
      const success = rewardsService.claimReward(user._id, rewardId);
      
      if (success) {
        showToast(NotificationType.SUCCESS, 'Reward claimed successfully!');
        // Refresh user rewards
        const rewards = rewardsService.getUserRewards(user._id);
        setUserRewards(rewards);
      } else {
        showToast(NotificationType.ERROR, 'Failed to claim reward. It may have expired or already been claimed.');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      showToast(NotificationType.ERROR, 'An error occurred while claiming the reward.');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const currentTier = userRewards ? rewardsService.getUserTier(userRewards.totalPoints) : REWARD_TIERS[0];
  const nextTierProgress = userRewards ? rewardsService.getProgressToNextTier(userRewards.totalPoints) : { current: 0, next: 100, progress: 0 };

  return (
    <>
      <Head>
        <title>Rewards | Fanatikoin</title>
        <meta name="description" content="Earn rewards for using the Fanatikoin platform" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Fan Rewards Program</h1>
        
        {/* User rewards summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-semibold">
                <span className={currentTier.color}>{currentTier.name}</span>
              </h2>
              <p className="text-gray-600">
                Total Points: <span className="font-semibold">{userRewards?.totalPoints || 0}</span>
              </p>
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="flex justify-between text-sm mb-1">
                <span>Level {currentTier.level}</span>
                {nextTierProgress.progress < 100 && (
                  <span>Level {currentTier.level + 1}</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-primary h-4 rounded-full" 
                  style={{ width: `${nextTierProgress.progress}%` }}
                ></div>
              </div>
              {nextTierProgress.progress < 100 ? (
                <p className="text-sm text-gray-600 mt-1">
                  {nextTierProgress.current} / {nextTierProgress.next} points to next level
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  Maximum level reached!
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rewards'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Rewards
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reward History
            </button>
            <button
              onClick={() => setActiveTab('tiers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tiers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fan Tiers
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="mb-8">
          {activeTab === 'rewards' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Available Rewards</h2>
              
              {userRewards?.rewards.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">No rewards available at the moment. Keep using the platform to earn rewards!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userRewards?.rewards
                    .filter(reward => !reward.claimed && (!reward.expiresAt || reward.expiresAt > Date.now()))
                    .map(reward => (
                      <div key={reward.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="h-32 bg-gray-200 flex items-center justify-center">
                          {reward.imageUrl ? (
                            <img 
                              src={reward.imageUrl} 
                              alt={reward.title} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-4xl text-gray-400">🏆</div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">{reward.title}</h3>
                          <p className="text-gray-600 mb-4">{reward.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-primary font-semibold">{reward.points} points</span>
                            <button
                              onClick={() => handleClaimReward(reward.id)}
                              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                            >
                              Claim
                            </button>
                          </div>
                          {reward.expiresAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Expires: {new Date(reward.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'history' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Reward History</h2>
              
              {userRewards?.history.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">No reward history yet. Start using the platform to earn rewards!</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userRewards?.history.map(history => (
                        <tr key={history.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(history.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {history.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {history.type.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                            +{history.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'tiers' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Fan Tiers</h2>
              
              <div className="space-y-6">
                {REWARD_TIERS.map(tier => (
                  <div 
                    key={tier.level} 
                    className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                      tier.level === currentTier.level ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-xl font-bold ${tier.color}`}>
                        {tier.name}
                        {tier.level === currentTier.level && (
                          <span className="ml-2 text-sm bg-primary text-white px-2 py-1 rounded">
                            Current Tier
                          </span>
                        )}
                      </h3>
                      <span className="text-gray-600">{tier.minPoints} points</span>
                    </div>
                    
                    <h4 className="font-semibold mb-2">Benefits:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="text-gray-700">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* How to earn more points */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">How to Earn More Points</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold mb-2">Complete Transactions</h3>
              <p className="text-gray-600">Earn points for every transaction you make on the platform.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold mb-2">Refer Friends</h3>
              <p className="text-gray-600">Earn 50 points for each friend you refer who joins the platform.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold mb-2">Hold Tokens</h3>
              <p className="text-gray-600">Earn points based on the tokens you hold in your wallet.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-3xl mb-2">🗓️</div>
              <h3 className="font-semibold mb-2">Daily Login</h3>
              <p className="text-gray-600">Earn 10 points every day you log in to the platform.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold mb-2">Community Engagement</h3>
              <p className="text-gray-600">Participate in discussions and events to earn engagement points.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Special Events</h3>
              <p className="text-gray-600">Participate in limited-time events for bonus points and rewards.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default RewardsPage;
