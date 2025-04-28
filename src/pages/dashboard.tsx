import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FanEngagement from '@/components/staking/FanEngagement';
import { useTokenStaking } from '@/hooks/useTokenStaking';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Profile from '@/components/user/Profile';

import { useContext } from 'react';
import { TokenContext } from '@/context/TokenContext';

const Dashboard: React.FC = () => {
  // Prevent SSR/Static Export errors: Only render on client
  if (typeof window === 'undefined') {
    // Optionally, render a loading spinner or null
    return null;
  }
  const { user, isAuthenticated } = useAuth();
  // Determine role
  let role = 'fan';
  if (user?.isAdmin) role = 'admin';
  else if (user?.isTeam) role = 'team';

  const {
    stakingInfo,
    userStakeInfo,
    claimableRewards,
    stake,
    unstake,
    claimRewards,
    loading,
    error
  } = useTokenStaking();

  const { tokens } = useContext(TokenContext) || { tokens: [] };
  // Use the first token as an example for staking/fan engagement
  const token = tokens[0] || { address: '', name: 'SampleToken', symbol: 'FTK', balance: 0, price: 0, description: '', totalValue: 0 };

  const router = useRouter();

  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }
  // Handlers for staking actions
  const handleStake = () => {
    // You may want to prompt for amount in production
    stake(token.address, '1');
  };
  const handleUnstake = () => {
    unstake(token.address);
  };
  const handleClaim = () => {
    claimRewards(token.address);
  };
  // Fan Engagement update handler
  const handleFanUpdate = () => {
    // Optionally refresh data
  };

  return (
    <div>
      <div className="max-w-5xl mx-auto py-8 px-4 grid gap-8 grid-cols-1 md:grid-cols-2">
        <div>
          <Card>
            <h2 className="text-xl font-bold mb-4">Welcome, {user?.username || 'Fan'}!</h2>
            <Profile />
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Your Staking</h3>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="mb-2">Balance: {userStakeInfo?.formattedStakedAmount ?? '0'} {token.symbol}</div>
                  <div className="mb-2">APY: {stakingInfo?.rewardRate ?? 0}%</div>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={handleStake}>Stake</Button>
                    <Button onClick={handleUnstake} variant="secondary">Unstake</Button>
                    <Button onClick={handleClaim} variant="primary">Claim Rewards</Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <h3 className="font-semibold mb-4">Fan Engagement</h3>
            <FanEngagement token={{
  ...token,
  balance: typeof (token as any).balance === 'bigint' ? (token as any).balance : BigInt((token as any).balance ?? 0),
  price: typeof token.price === 'number' ? token.price : Number(token.price ?? 0),
  totalValue: typeof (token as any).totalValue === 'number' ? (token as any).totalValue : Number((token as any).totalValue ?? 0),
  benefits: Array.isArray(token.benefits)
    ? (token.benefits as any[]).map((b, i) =>
        typeof b === 'string'
          ? {
              id: `${token.address}-benefit-${i}`,
              name: b,
              description: b,
              requiredAmount: 0,
              category: 'other'
            }
          : b
      )
    : [],
}} onUpdate={handleFanUpdate} />
          </Card>
          {role === 'admin' && (
            <Card className="mt-8">
              <h3 className="font-semibold mb-4">Admin Panel</h3>
              <Button onClick={() => router.push('/admin')}>Go to Admin Dashboard</Button>
            </Card>
          )}
          {role === 'team' && (
            <Card className="mt-8">
              <h3 className="font-semibold mb-4">Team Dashboard</h3>
              <Button onClick={() => router.push('/team')}>Go to Team Dashboard</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
