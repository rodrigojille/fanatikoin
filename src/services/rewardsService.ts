import { Reward, RewardHistory, RewardTier, RewardType, UserRewards } from '@/types/rewards';
import { User } from '@/types/auth';

// Define reward tiers
export const REWARD_TIERS: RewardTier[] = [
  {
    level: 1,
    name: 'Bronze Fan',
    minPoints: 0,
    benefits: ['Basic platform access', 'Standard transaction fees'],
    color: 'text-amber-700'
  },
  {
    level: 2,
    name: 'Silver Fan',
    minPoints: 100,
    benefits: ['Reduced transaction fees (0.5% off)', 'Early access to new tokens'],
    color: 'text-gray-400'
  },
  {
    level: 3,
    name: 'Gold Fan',
    minPoints: 500,
    benefits: ['Reduced transaction fees (1% off)', 'Exclusive token airdrops', 'Priority customer support'],
    color: 'text-yellow-500'
  },
  {
    level: 4,
    name: 'Platinum Fan',
    minPoints: 1000,
    benefits: ['Reduced transaction fees (1.5% off)', 'VIP token airdrops', 'Exclusive team events access', 'Premium customer support'],
    color: 'text-blue-400'
  },
  {
    level: 5,
    name: 'Diamond Fan',
    minPoints: 2500,
    benefits: ['Reduced transaction fees (2% off)', 'Premium token airdrops', 'Exclusive team events access', 'Dedicated customer support', 'Voting rights on platform features'],
    color: 'text-blue-600'
  }
];

// In-memory storage for user rewards (would be replaced with a database in production)
const userRewardsMap = new Map<string, UserRewards>();

/**
 * Initialize rewards for a new user
 */
export const initializeUserRewards = (userId: string): UserRewards => {
  const newUserRewards: UserRewards = {
    userId,
    totalPoints: 0,
    level: 1,
    rewards: [],
    history: []
  };
  
  userRewardsMap.set(userId, newUserRewards);
  return newUserRewards;
};

/**
 * Get user rewards by user ID
 */
export const getUserRewards = (userId: string): UserRewards => {
  let userRewards = userRewardsMap.get(userId);
  
  if (!userRewards) {
    userRewards = initializeUserRewards(userId);
  }
  
  return userRewards;
};

/**
 * Add points to a user's rewards
 */
export const addRewardPoints = (
  userId: string,
  type: RewardType,
  points: number,
  description: string
): RewardHistory => {
  const userRewards = getUserRewards(userId);
  
  // Create reward history entry
  const historyEntry: RewardHistory = {
    id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    rewardId: '',
    type,
    points,
    timestamp: Date.now(),
    description
  };
  
  // Update user's total points
  userRewards.totalPoints += points;
  
  // Update user's level based on total points
  userRewards.level = calculateUserLevel(userRewards.totalPoints);
  
  // Add history entry
  userRewards.history.unshift(historyEntry);
  
  // Save updated user rewards
  userRewardsMap.set(userId, userRewards);
  
  return historyEntry;
};

/**
 * Create a new reward for a user
 */
export const createReward = (
  userId: string,
  type: RewardType,
  title: string,
  description: string,
  points: number,
  imageUrl?: string,
  expiresAt?: number
): Reward => {
  const userRewards = getUserRewards(userId);
  
  // Create new reward
  const reward: Reward = {
    id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    description,
    points,
    imageUrl,
    createdAt: Date.now(),
    expiresAt,
    claimed: false,
    userId
  };
  
  // Add reward to user's rewards
  userRewards.rewards.unshift(reward);
  
  // Save updated user rewards
  userRewardsMap.set(userId, userRewards);
  
  return reward;
};

/**
 * Claim a reward
 */
export const claimReward = (userId: string, rewardId: string): boolean => {
  const userRewards = getUserRewards(userId);
  
  // Find the reward
  const rewardIndex = userRewards.rewards.findIndex(r => r.id === rewardId);
  
  if (rewardIndex === -1) {
    return false;
  }
  
  const reward = userRewards.rewards[rewardIndex];
  
  // Check if reward is already claimed
  if (reward.claimed) {
    return false;
  }
  
  // Check if reward is expired
  if (reward.expiresAt && reward.expiresAt < Date.now()) {
    return false;
  }
  
  // Mark reward as claimed
  reward.claimed = true;
  reward.claimedAt = Date.now();
  
  // Add points to user's total
  userRewards.totalPoints += reward.points;
  
  // Update user's level based on total points
  userRewards.level = calculateUserLevel(userRewards.totalPoints);
  
  // Create history entry
  const historyEntry: RewardHistory = {
    id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    rewardId: reward.id,
    type: reward.type,
    points: reward.points,
    timestamp: Date.now(),
    description: `Claimed reward: ${reward.title}`
  };
  
  // Add history entry
  userRewards.history.unshift(historyEntry);
  
  // Save updated user rewards
  userRewardsMap.set(userId, userRewards);
  
  return true;
};

/**
 * Calculate user level based on total points
 */
export const calculateUserLevel = (totalPoints: number): number => {
  let level = 1;
  
  for (const tier of REWARD_TIERS) {
    if (totalPoints >= tier.minPoints) {
      level = tier.level;
    } else {
      break;
    }
  }
  
  return level;
};

/**
 * Get user's current tier
 */
export const getUserTier = (totalPoints: number): RewardTier => {
  const level = calculateUserLevel(totalPoints);
  return REWARD_TIERS.find(tier => tier.level === level) || REWARD_TIERS[0];
};

/**
 * Get user's progress to next tier
 */
export const getProgressToNextTier = (totalPoints: number): { current: number, next: number, progress: number } => {
  const currentLevel = calculateUserLevel(totalPoints);
  const currentTier = REWARD_TIERS.find(tier => tier.level === currentLevel) || REWARD_TIERS[0];
  const nextTierIndex = REWARD_TIERS.findIndex(tier => tier.level === currentLevel) + 1;
  
  if (nextTierIndex >= REWARD_TIERS.length) {
    // User is at max level
    return {
      current: totalPoints,
      next: currentTier.minPoints,
      progress: 100
    };
  }
  
  const nextTier = REWARD_TIERS[nextTierIndex];
  const pointsNeeded = nextTier.minPoints - currentTier.minPoints;
  const pointsEarned = totalPoints - currentTier.minPoints;
  const progress = Math.min(100, Math.floor((pointsEarned / pointsNeeded) * 100));
  
  return {
    current: totalPoints,
    next: nextTier.minPoints,
    progress
  };
};

/**
 * Award daily login reward
 */
export const awardDailyLoginReward = (user: User): Reward => {
  // Check if user already claimed daily reward today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const userRewards = getUserRewards(user.id);
  const alreadyClaimed = userRewards.history.some(h => 
    h.type === RewardType.DAILY_LOGIN && 
    new Date(h.timestamp).setHours(0, 0, 0, 0) === today.getTime()
  );
  
  if (alreadyClaimed) {
    throw new Error('Daily reward already claimed today');
  }
  
  // Create reward
  const reward = createReward(
    user.id,
    RewardType.DAILY_LOGIN,
    'Daily Login Bonus',
    'Thanks for logging in today!',
    10,
    '/images/rewards/daily-login.svg'
  );
  
  // Automatically claim the reward
  claimReward(user.id, reward.id);
  
  return reward;
};

/**
 * Award transaction reward
 */
export const awardTransactionReward = (user: User, transactionValue: number): Reward => {
  // Points are 1% of transaction value, minimum 1 point
  const points = Math.max(1, Math.floor(transactionValue * 0.01));
  
  // Create reward
  const reward = createReward(
    user.id,
    RewardType.TRANSACTION,
    'Transaction Reward',
    `Earned ${points} points for completing a transaction`,
    points,
    '/images/rewards/transaction.svg'
  );
  
  // Automatically claim the reward
  claimReward(user.id, reward.id);
  
  return reward;
};

/**
 * Award referral reward
 */
export const awardReferralReward = (user: User, referredUser: User): Reward => {
  // Create reward
  const reward = createReward(
    user.id,
    RewardType.REFERRAL,
    'Referral Bonus',
    `You referred ${referredUser.username || 'a new user'} to Fanatikoin!`,
    50,
    '/images/rewards/referral.svg'
  );
  
  // Automatically claim the reward
  claimReward(user.id, reward.id);
  
  return reward;
};

/**
 * Award token holding reward
 */
export const awardTokenHoldingReward = (user: User, tokenName: string, amount: number): Reward => {
  // Create reward
  const reward = createReward(
    user.id,
    RewardType.TOKEN_HOLDING,
    'Token Holding Bonus',
    `Earned for holding ${amount} ${tokenName} tokens`,
    Math.floor(amount * 0.1), // 0.1 points per token
    '/images/rewards/token-holding.svg'
  );
  
  // Automatically claim the reward
  claimReward(user.id, reward.id);
  
  return reward;
};

export default {
  getUserRewards,
  addRewardPoints,
  createReward,
  claimReward,
  calculateUserLevel,
  getUserTier,
  getProgressToNextTier,
  awardDailyLoginReward,
  awardTransactionReward,
  awardReferralReward,
  awardTokenHoldingReward,
  initializeUserRewards,
  REWARD_TIERS
};
