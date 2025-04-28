import { useState, useEffect, useCallback } from 'react';
import { formatUnits, formatEther, parseEther, Contract } from 'ethers';
import { metamaskService } from '@/services/metamask';
import { CONTRACT_ADDRESSES } from '@/contracts/config';
import TokenStakingABI from '@/contracts/TokenStaking.json';
import TeamTokenABI from '@/contracts/TeamToken.json';

interface StakingInfo {
  rewardRate: number;
  lockPeriod: number;
  totalStaked: number;
  isSupported: boolean;
}

interface UserStakeInfo {
  stakedAmount: string;
  startTime: number;
  lastClaimTime: number;
  hasStake: boolean;
  remainingLockTime: number;
  formattedStakedAmount: string;
}

interface TokenStakingHook {
  loading: boolean;
  error: string | null;
  stakingInfo: StakingInfo | null;
  userStakeInfo: UserStakeInfo | null;
  claimableRewards: string;
  stake: (tokenAddress: string, amount: string) => Promise<boolean>;
  unstake: (tokenAddress: string) => Promise<boolean>;
  claimRewards: (tokenAddress: string) => Promise<boolean>;
  refreshStakingInfo: (tokenAddress: string) => Promise<void>;
}

/**
 * Hook for interacting with the token staking contract
 */
export const useTokenStaking = (): TokenStakingHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null);
  const [userStakeInfo, setUserStakeInfo] = useState<UserStakeInfo | null>(null);
  const [claimableRewards, setClaimableRewards] = useState<string>('0');

  /**
   * Get staking contract instance
   */
  const getStakingContract = useCallback(async () => {
    try {
      const provider = metamaskService.getProvider();
      const signer = await metamaskService.getSigner();
      
      if (!provider || !signer) {
        throw new Error('Provider or signer not available');
      }
      
      const stakingContract = new Contract(
        CONTRACT_ADDRESSES.TokenStaking,
        TokenStakingABI.abi,
        signer
      );
      
      return stakingContract;
    } catch (error) {
      console.error('[useTokenStaking] Error getting staking contract:', error);
      throw error;
    }
  }, []);

  /**
   * Get token contract instance
   */
  const getTokenContract = useCallback(async (tokenAddress: string) => {
    try {
      const provider = metamaskService.getProvider();
      const signer = await metamaskService.getSigner();
      
      if (!provider || !signer) {
        throw new Error('Provider or signer not available');
      }
      
      const tokenContract = new Contract(
        tokenAddress,
        TeamTokenABI.abi,
        signer
      );
      
      return tokenContract;
    } catch (error) {
      console.error('[useTokenStaking] Error getting token contract:', error);
      throw error;
    }
  }, []);

  /**
   * Refresh staking information for a token
   */
  const refreshStakingInfo = useCallback(async (tokenAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const stakingContract = await getStakingContract();
      const userAddress = metamaskService.getAddress();
      
      if (!userAddress) {
        throw new Error('User not connected');
      }
      
      // Get token staking info
      const tokenInfo = await stakingContract.getTokenStakingInfo(tokenAddress);
      
      setStakingInfo({
        rewardRate: Number(formatUnits(tokenInfo.rewardRate, 2)),
        lockPeriod: Number(tokenInfo.lockPeriod),
        totalStaked: Number(formatEther(tokenInfo.totalStaked)),
        isSupported: tokenInfo.isSupported
      });
      
      // Get user staking info
      const userInfo = await stakingContract.getUserStakingInfo(userAddress, tokenAddress);
      
      const now = Math.floor(Date.now() / 1000);
      const endLockTime = Number(userInfo.startTime) + Number(tokenInfo.lockPeriod);
      const remainingLockTime = Math.max(0, endLockTime - now);
      
      setUserStakeInfo({
        stakedAmount: userInfo.stakedAmount.toString(),
        formattedStakedAmount: formatEther(userInfo.stakedAmount),
        startTime: Number(userInfo.startTime),
        lastClaimTime: Number(userInfo.lastClaimTime),
        hasStake: userInfo.hasStake,
        remainingLockTime
      });
      
      // Get claimable rewards
      const rewards = await stakingContract.getClaimableRewards(userAddress, tokenAddress);
      setClaimableRewards(formatEther(rewards));
      
    } catch (error) {
      console.error('[useTokenStaking] Error refreshing staking info:', error);
      setError('Failed to load staking information');
    } finally {
      setLoading(false);
    }
  }, [getStakingContract]);

  /**
   * Stake tokens
   */
  const stake = useCallback(async (tokenAddress: string, amount: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const stakingContract = await getStakingContract();
      const tokenContract = await getTokenContract(tokenAddress);
      const userAddress = metamaskService.getAddress();
      
      if (!userAddress) {
        throw new Error('User not connected');
      }
      
      // Convert amount to wei
      const amountWei = parseEther(amount);
      
      // Check token balance
      const balance = await tokenContract.balanceOf(userAddress);
      if (balance.lt(amountWei)) {
        throw new Error('Insufficient token balance');
      }
      
      // Approve tokens for staking
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.TokenStaking, amountWei);
      await approveTx.wait();
      
      // Stake tokens
      const stakeTx = await stakingContract.stake(tokenAddress, amountWei);
      await stakeTx.wait();
      
      // Refresh staking info
      await refreshStakingInfo(tokenAddress);
      
      return true;
    } catch (error) {
      console.error('[useTokenStaking] Error staking tokens:', error);
      setError('Failed to stake tokens: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStakingContract, getTokenContract, refreshStakingInfo]);

  /**
   * Unstake tokens
   */
  const unstake = useCallback(async (tokenAddress: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const stakingContract = await getStakingContract();
      
      // Unstake tokens
      const unstakeTx = await stakingContract.unstake(tokenAddress);
      await unstakeTx.wait();
      
      // Refresh staking info
      await refreshStakingInfo(tokenAddress);
      
      return true;
    } catch (error) {
      console.error('[useTokenStaking] Error unstaking tokens:', error);
      setError('Failed to unstake tokens: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStakingContract, refreshStakingInfo]);

  /**
   * Claim rewards
   */
  const claimRewards = useCallback(async (tokenAddress: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const stakingContract = await getStakingContract();
      
      // Claim rewards
      const claimTx = await stakingContract.claimRewards(tokenAddress);
      await claimTx.wait();
      
      // Refresh staking info
      await refreshStakingInfo(tokenAddress);
      
      return true;
    } catch (error) {
      console.error('[useTokenStaking] Error claiming rewards:', error);
      setError('Failed to claim rewards: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStakingContract, refreshStakingInfo]);

  return {
    loading,
    error,
    stakingInfo,
    userStakeInfo,
    claimableRewards,
    stake,
    unstake,
    claimRewards,
    refreshStakingInfo
  };
};

export default useTokenStaking;
