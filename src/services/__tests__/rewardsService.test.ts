import rewardsService, { REWARD_TIERS } from '../rewardsService';
import { RewardType } from '@/types/rewards';
import { User } from '@/types/auth';

describe('Rewards Service', () => {
  // Mock user for testing
  const mockUser: User = {
    id: 'test-user-123',
    email: 'test@example.com',
    username: 'testuser',
    walletAddress: '0x1234567890abcdef',
    isAdmin: false
  };

  beforeEach(() => {
    // Reset any internal state between tests
    jest.clearAllMocks();
  });

  it('initializes user rewards correctly', () => {
    const userRewards = rewardsService.initializeUserRewards(mockUser.id);
    
    expect(userRewards).toEqual({
      userId: mockUser.id,
      totalPoints: 0,
      level: 1,
      rewards: [],
      history: []
    });
  });

  it('gets user rewards by ID', () => {
    // Initialize user rewards first
    rewardsService.initializeUserRewards(mockUser.id);
    
    // Get user rewards
    const userRewards = rewardsService.getUserRewards(mockUser.id);
    
    expect(userRewards.userId).toBe(mockUser.id);
    expect(userRewards.totalPoints).toBe(0);
    expect(userRewards.level).toBe(1);
  });

  it('adds reward points correctly', () => {
    // Initialize user rewards
    rewardsService.initializeUserRewards(mockUser.id);
    
    // Add points
    const historyEntry = rewardsService.addRewardPoints(
      mockUser.id,
      RewardType.TRANSACTION,
      50,
      'Test transaction'
    );
    
    // Get updated user rewards
    const userRewards = rewardsService.getUserRewards(mockUser.id);
    
    expect(userRewards.totalPoints).toBe(50);
    expect(userRewards.history.length).toBe(1);
    expect(userRewards.history[0].type).toBe(RewardType.TRANSACTION);
    expect(userRewards.history[0].points).toBe(50);
    expect(userRewards.history[0].description).toBe('Test transaction');
  });

  it('creates and claims rewards correctly', () => {
    // Initialize user rewards
    rewardsService.initializeUserRewards(mockUser.id);
    
    // Create a reward
    const reward = rewardsService.createReward(
      mockUser.id,
      RewardType.DAILY_LOGIN,
      'Daily Login',
      'Logged in today',
      10
    );
    
    // Verify reward was created
    let userRewards = rewardsService.getUserRewards(mockUser.id);
    expect(userRewards.rewards.length).toBe(1);
    expect(userRewards.rewards[0].id).toBe(reward.id);
    expect(userRewards.rewards[0].claimed).toBe(false);
    
    // Claim the reward
    const claimed = rewardsService.claimReward(mockUser.id, reward.id);
    expect(claimed).toBe(true);
    
    // Verify reward was claimed and points were added
    userRewards = rewardsService.getUserRewards(mockUser.id);
    expect(userRewards.rewards[0].claimed).toBe(true);
    expect(userRewards.totalPoints).toBe(10);
    expect(userRewards.history.length).toBe(1);
  });

  it('calculates user level correctly based on points', () => {
    // Test each tier boundary
    expect(rewardsService.calculateUserLevel(0)).toBe(1);
    expect(rewardsService.calculateUserLevel(99)).toBe(1);
    expect(rewardsService.calculateUserLevel(100)).toBe(2);
    expect(rewardsService.calculateUserLevel(499)).toBe(2);
    expect(rewardsService.calculateUserLevel(500)).toBe(3);
    expect(rewardsService.calculateUserLevel(999)).toBe(3);
    expect(rewardsService.calculateUserLevel(1000)).toBe(4);
    expect(rewardsService.calculateUserLevel(2499)).toBe(4);
    expect(rewardsService.calculateUserLevel(2500)).toBe(5);
    expect(rewardsService.calculateUserLevel(10000)).toBe(5);
  });

  it('gets correct user tier based on points', () => {
    expect(rewardsService.getUserTier(0).name).toBe('Bronze Fan');
    expect(rewardsService.getUserTier(100).name).toBe('Silver Fan');
    expect(rewardsService.getUserTier(500).name).toBe('Gold Fan');
    expect(rewardsService.getUserTier(1000).name).toBe('Platinum Fan');
    expect(rewardsService.getUserTier(2500).name).toBe('Diamond Fan');
  });

  it('calculates progress to next tier correctly', () => {
    // Bronze to Silver (0 to 100 points)
    let progress = rewardsService.getProgressToNextTier(50);
    expect(progress.current).toBe(50);
    expect(progress.next).toBe(100);
    expect(progress.progress).toBe(50);
    
    // Silver to Gold (100 to 500 points)
    progress = rewardsService.getProgressToNextTier(300);
    expect(progress.current).toBe(300);
    expect(progress.next).toBe(500);
    expect(progress.progress).toBe(50);
    
    // At max level
    progress = rewardsService.getProgressToNextTier(3000);
    expect(progress.progress).toBe(100);
  });

  it('awards daily login reward correctly', () => {
    // Initialize user rewards
    rewardsService.initializeUserRewards(mockUser.id);
    
    // Award daily login reward
    const reward = rewardsService.awardDailyLoginReward(mockUser);
    
    // Verify reward was created and claimed
    const userRewards = rewardsService.getUserRewards(mockUser.id);
    expect(userRewards.totalPoints).toBe(10);
    expect(userRewards.rewards.length).toBe(1);
    expect(userRewards.rewards[0].type).toBe(RewardType.DAILY_LOGIN);
    expect(userRewards.rewards[0].claimed).toBe(true);
    
    // Attempting to claim again on the same day should throw an error
    expect(() => {
      rewardsService.awardDailyLoginReward(mockUser);
    }).toThrow('Daily reward already claimed today');
  });

  it('awards transaction reward correctly', () => {
    // Initialize user rewards
    rewardsService.initializeUserRewards(mockUser.id);
    
    // Award transaction reward
    const reward = rewardsService.awardTransactionReward(mockUser, 100);
    
    // Verify reward was created and claimed
    const userRewards = rewardsService.getUserRewards(mockUser.id);
    expect(userRewards.totalPoints).toBe(1); // 1% of 100
    expect(userRewards.rewards.length).toBe(1);
    expect(userRewards.rewards[0].type).toBe(RewardType.TRANSACTION);
    expect(userRewards.rewards[0].claimed).toBe(true);
  });

  it('awards referral reward correctly', () => {
    // Initialize user rewards
    rewardsService.initializeUserRewards(mockUser.id);
    
    // Create a referred user
    const referredUser: User = {
      id: 'referred-user-123',
      email: 'referred@example.com',
      username: 'referreduser',
      walletAddress: '0xabcdef1234567890',
      isAdmin: false
    };
    
    // Award referral reward
    const reward = rewardsService.awardReferralReward(mockUser, referredUser);
    
    // Verify reward was created and claimed
    const userRewards = rewardsService.getUserRewards(mockUser.id);
    expect(userRewards.totalPoints).toBe(50);
    expect(userRewards.rewards.length).toBe(1);
    expect(userRewards.rewards[0].type).toBe(RewardType.REFERRAL);
    expect(userRewards.rewards[0].claimed).toBe(true);
  });

  it('awards token holding reward correctly', () => {
    // Initialize user rewards
    rewardsService.initializeUserRewards(mockUser.id);
    
    // Award token holding reward
    const reward = rewardsService.awardTokenHoldingReward(mockUser, 'Barcelona Fan Token', 1000);
    
    // Verify reward was created and claimed
    const userRewards = rewardsService.getUserRewards(mockUser.id);
    expect(userRewards.totalPoints).toBe(100); // 0.1 points per token
    expect(userRewards.rewards.length).toBe(1);
    expect(userRewards.rewards[0].type).toBe(RewardType.TOKEN_HOLDING);
    expect(userRewards.rewards[0].claimed).toBe(true);
  });
});
