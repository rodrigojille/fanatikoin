import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { useToken } from '@/context/TokenContext';
import { ethers, BrowserProvider, formatUnits } from 'ethers';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import TokenStakingABI from '@/contracts/TokenStaking.json';
import { CONTRACT_ADDRESSES, STAKING_CONFIG } from '@/contracts/config';
import { UserToken, TokenStaking } from '@/types/token';
import toast from 'react-hot-toast';

const StakingPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { provider, address, isConnected } = useWeb3();
  const { tokens } = useToken();
  
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [userStakes, setUserStakes] = useState<TokenStaking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [stakedTokens, setStakedTokens] = useState<UserToken[]>([]);
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');

  // Handle token selection
  const handleTokenSelect = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    setStakeAmount('');
  };

  // Calculate APY based on amount staked
  const calculateAPY = (tokenAmount: number): number => {
    let apy = STAKING_CONFIG.rewardBaseRate;
    
    // Apply boost based on amount
    if (tokenAmount >= STAKING_CONFIG.rewardBoost.tier3.amount) {
      apy += STAKING_CONFIG.rewardBoost.tier3.boost;
    } else if (tokenAmount >= STAKING_CONFIG.rewardBoost.tier2.amount) {
      apy += STAKING_CONFIG.rewardBoost.tier2.boost;
    } else if (tokenAmount >= STAKING_CONFIG.rewardBoost.tier1.amount) {
      apy += STAKING_CONFIG.rewardBoost.tier1.boost;
    }
    
    return apy / 100; // Convert basis points to percentage
  };

  // Get user staking information
  const fetchUserStakes = async () => {
    if (!address || !provider || !isConnected) return;
    
    try {
      setIsLoading(true);
      // Ensure provider is a BrowserProvider (ethers v6)
      const browserProvider = provider instanceof BrowserProvider ? provider : new BrowserProvider(window.ethereum);
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TokenStaking,
        TokenStakingABI.abi,
        browserProvider
      );
      
      const userStakingInfo: TokenStaking[] = [];
      const stakedTokenList: UserToken[] = [];
      
      // Helper function to convert Token to UserToken
      const convertToUserToken = (token: any): UserToken => {
        const price = typeof token.price === 'number' ? token.price : 
                     typeof token.price === 'string' ? parseFloat(token.price) : 0;
        
        return {
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          description: token.description || '',
          balance: BigInt(0), // Will be updated with actual balance
          price: price,
          totalValue: 0, // Will be calculated based on balance
          benefits: token.benefits ? token.benefits.map((benefit: string, index: number) => ({
            id: `benefit-${index}`,
            name: benefit,
            description: benefit,
            requiredAmount: 1,
            category: 'other' as const
          })) : []
        };
      };

      // For each token, check if user has a stake
      for (const token of tokens) {
        const stakeInfo = await stakingContract.getUserStakingInfo(address, token.address);
        
        if (stakeInfo.hasStake) {
          const tokenInfo = await stakingContract.getTokenStakingInfo(token.address);
          const claimableRewards = await stakingContract.getClaimableRewards(address, token.address);
          
          const stakingData: TokenStaking = {
            tokenAddress: token.address,
            tokenSymbol: token.symbol,
            stakedAmount: stakeInfo.stakedAmount,
            startTime: new Date(Number(stakeInfo.startTime) * 1000).toISOString(),
            endTime: new Date((Number(stakeInfo.startTime) + Number(tokenInfo.lockPeriod)) * 1000).toISOString(),
            lockPeriod: Number(tokenInfo.lockPeriod),
            rewards: claimableRewards,
            apy: calculateAPY(Number(ethers.formatUnits(stakeInfo.stakedAmount, 18)))
          };
          
          userStakingInfo.push(stakingData);
          // Convert Token to UserToken before pushing
          stakedTokenList.push(convertToUserToken(token));
        }
      }
      
      setUserStakes(userStakingInfo);
      setStakedTokens(stakedTokenList);
    } catch (error) {
      console.error('Error fetching user stakes:', error);
      toast.error(t('staking.fetchError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Stake tokens
  const stakeTokens = async () => {
    if (!address || !provider || !selectedToken || !stakeAmount) return;
    // Ensure provider is a BrowserProvider (ethers v6)
    const browserProvider = provider instanceof BrowserProvider ? provider : new BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();
    if (!address || !provider || !selectedToken || !stakeAmount) return;
    
    try {
      setIsStaking(true);
      const browserProvider = provider instanceof BrowserProvider ? provider : new BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TokenStaking,
        TokenStakingABI.abi,
        signer
      );
      
      // Find the selected token
      const token = tokens.find(t => t.address === selectedToken);
      if (!token) {
        toast.error(t('staking.tokenNotFound'));
        return;
      }
      
      // Check if amount is valid
      const amount = ethers.parseUnits(stakeAmount, 18);
      if (amount < ethers.parseUnits(STAKING_CONFIG.minStakeAmount.toString(), 18)) {
        toast.error(t('staking.minStakeError', { min: STAKING_CONFIG.minStakeAmount }));
        return;
      }
      
      // In a real implementation, we would check the user's token balance here
      // For now, we'll skip this check since we don't have access to the balance in the Token type
      // TODO: Implement proper balance checking using a contract call
      // const balance = await tokenContract.balanceOf(address);
      // if (amount > balance) {
      //   toast.error(t('staking.insufficientBalance'));
      //   return;
      // }
      
      // First approve tokens for staking
      const tokenContract = new ethers.Contract(
        token.address,
        ['function approve(address spender, uint256 amount) public returns (bool)'],
        signer
      );
      
      toast.loading(t('staking.approvingTokens'));
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.TokenStaking, amount);
      await approveTx.wait();
      toast.dismiss();
      
      // Stake tokens
      toast.loading(t('staking.stakingTokens'));
      const stakeTx = await stakingContract.stake(token.address, amount);
      await stakeTx.wait();
      toast.dismiss();
      
      toast.success(t('staking.stakeSuccess'));
      setStakeAmount('');
      fetchUserStakes();
    } catch (error) {
      console.error('Error staking tokens:', error);
      toast.error(t('staking.stakeError'));
    } finally {
      setIsStaking(false);
    }
  };

  // Unstake tokens
  const unstakeTokens = async (tokenAddress: string) => {
    if (!address || !provider) return;
    
    try {
      setIsUnstaking(true);
      const browserProvider = provider instanceof BrowserProvider ? provider : new BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TokenStaking,
        TokenStakingABI.abi,
        signer
      );
      
      toast.loading(t('staking.unstakingTokens'));
      const unstakeTx = await stakingContract.unstake(tokenAddress);
      await unstakeTx.wait();
      toast.dismiss();
      
      toast.success(t('staking.unstakeSuccess'));
      fetchUserStakes();
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      toast.error(t('staking.unstakeError'));
    } finally {
      setIsUnstaking(false);
    }
  };

  // Claim rewards
  const claimRewards = async (tokenAddress: string) => {
    if (!address || !provider) return;
    
    try {
      setIsClaiming(true);
      const browserProvider = provider instanceof BrowserProvider ? provider : new BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TokenStaking,
        TokenStakingABI.abi,
        signer
      );
      
      toast.loading(t('staking.claimingRewards'));
      const claimTx = await stakingContract.claimRewards(tokenAddress);
      await claimTx.wait();
      toast.dismiss();
      
      toast.success(t('staking.claimSuccess'));
      fetchUserStakes();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast.error(t('staking.claimError'));
    } finally {
      setIsClaiming(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if token is still locked
  const isTokenLocked = (stake: TokenStaking): boolean => {
    const now = new Date();
    const endTime = new Date(stake.endTime);
    return now < endTime;
  };

  // Get remaining lock time in days
  const getRemainingLockDays = (stake: TokenStaking): number => {
    const now = new Date();
    const endTime = new Date(stake.endTime);
    const diffTime = endTime.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Load user stakes on component mount
  useEffect(() => {
    if (isConnected && tokens.length > 0) {
      fetchUserStakes();
    }
  }, [isConnected, tokens, address]);

  return (
    <Layout>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('staking.title')}</h1>
        <p className="text-gray-100">
          {t('staking.subtitle')}
        </p>
      </div>

      {!isConnected ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-xl font-bold mb-2">{t('staking.connectWallet')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('staking.connectToStake')}
          </p>
          <button
            onClick={() => window.open('/', '_self')}
            className="btn-primary"
          >
            {t('common.connectWallet')}
          </button>
        </div>
      ) : isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">{t('staking.loadingStakes')}</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('stake')}
                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'stake'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {t('staking.stakeTokens')}
              </button>
              <button
                onClick={() => setActiveTab('unstake')}
                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'unstake'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {t('staking.yourStakes')}
              </button>
            </nav>
          </div>

          {/* Staking Form */}
          {activeTab === 'stake' && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">{t('staking.stakeTokens')}</h2>
              
              {tokens.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">{t('staking.noTokensToStake')}</p>
                  <button 
                    onClick={() => window.open('/marketplace', '_self')}
                    className="btn-primary"
                  >
                    {t('staking.browseMarketplace')}
                  </button>
                </div>
              ) : (
                <>
                  {/* Token Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('staking.selectToken')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {tokens.map(token => (
                        <div
                          key={token.address}
                          onClick={() => handleTokenSelect(token.address)}
                          className={`
                            p-4 rounded-lg border cursor-pointer transition-colors
                            ${selectedToken === token.address 
                              ? 'border-primary bg-primary bg-opacity-10' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary'}
                          `}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <span className="font-bold">{token.symbol.substring(0, 2)}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold">{token.name}</h4>
                              <p className="text-sm text-gray-500">
                                {t('staking.balance')}: {Number(ethers.formatUnits(BigInt(0), 18)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Staking Amount */}
                  {selectedToken && (
                    <>
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('staking.stakeAmount')}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            placeholder={t('staking.enterAmount')}
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800"
                            min={STAKING_CONFIG.minStakeAmount}
                            max={STAKING_CONFIG.maxStakeAmount}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <button
                              type="button"
                              onClick={() => {
                                const selectedTokenObj = tokens.find(t => t.address === selectedToken);
                                if (selectedTokenObj) {
                                  // In a real implementation, we would use the actual token balance
                                  // For now, we'll use a dummy value
                                  setStakeAmount(STAKING_CONFIG.maxStakeAmount.toString());
                                }
                              }}
                              className="text-sm text-primary hover:text-primary-dark"
                            >
                              {t('common.max')}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex justify-between text-sm">
                          <span className="text-gray-500">
                            {t('staking.minimumStake')}: {STAKING_CONFIG.minStakeAmount}
                          </span>
                          <span className="text-gray-500">
                            {t('staking.lockPeriod')}: 30 {t('staking.days')}
                          </span>
                        </div>
                      </div>

                      {/* APY Calculator */}
                      {stakeAmount && Number(stakeAmount) > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                          <h4 className="font-medium mb-2">{t('staking.estimatedRewards')}</h4>
                          <div className="flex justify-between mb-2">
                            <span>{t('staking.apy')}</span>
                            <span className="font-semibold text-green-500">
                              {calculateAPY(Number(stakeAmount))}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('staking.estimatedEarnings')} (30 {t('staking.days')})</span>
                            <span className="font-semibold">
                              {(Number(stakeAmount) * calculateAPY(Number(stakeAmount)) / 12).toFixed(2)} {tokens.find(t => t.address === selectedToken)?.symbol}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Staking Button */}
                      <button
                        onClick={stakeTokens}
                        disabled={isStaking || !stakeAmount || Number(stakeAmount) <= 0}
                        className="btn-primary w-full"
                      >
                        {isStaking ? t('common.processing') : t('staking.stakeNow')}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* User Stakes */}
          {activeTab === 'unstake' && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">{t('staking.yourStakes')}</h2>
              
              {userStakes.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">{t('staking.noStakes')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('staking.noStakesDesc')}
                  </p>
                  <button
                    onClick={() => setActiveTab('stake')}
                    className="btn-primary"
                  >
                    {t('staking.stakeNow')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {userStakes.map((stake, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                            <span className="font-bold">{stake.tokenSymbol.substring(0, 2)}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{stake.tokenSymbol}</h4>
                            <p className="text-sm text-gray-500">
                              {t('staking.stakedOn')}: {formatDate(stake.startTime)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{Number(ethers.formatUnits(stake.stakedAmount, 18)).toLocaleString()} {stake.tokenSymbol}</p>
                          <p className="text-sm text-green-500">{stake.apy}% APY</p>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">{t('staking.lockPeriod')}</p>
                            <p className="font-semibold">30 {t('staking.days')}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">{t('staking.unlockDate')}</p>
                            <p className="font-semibold">{formatDate(stake.endTime)}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">{t('staking.claimableRewards')}</p>
                            <p className="font-semibold text-green-500">
                              {Number(ethers.formatUnits(stake.rewards, 18)).toFixed(4)} CHZ
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => claimRewards(stake.tokenAddress)}
                            disabled={isClaiming || Number(stake.rewards) <= 0}
                            className={`btn-primary flex-1 ${Number(stake.rewards) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isClaiming ? t('common.processing') : t('staking.claimRewards')}
                          </button>
                          
                          <button
                            onClick={() => unstakeTokens(stake.tokenAddress)}
                            disabled={isUnstaking || isTokenLocked(stake)}
                            className={`btn-secondary flex-1 ${isTokenLocked(stake) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isUnstaking ? t('common.processing') : (
                              isTokenLocked(stake) 
                                ? `${t('staking.lockedFor')} ${getRemainingLockDays(stake)} ${t('staking.days')}`
                                : t('staking.unstake')
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default StakingPage;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common']))
    }
  };
};
