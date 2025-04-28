export enum RewardType {
  TRANSACTION = 'transaction',
  REFERRAL = 'referral',
  DAILY_LOGIN = 'daily_login',
  TOKEN_HOLDING = 'token_holding',
  COMMUNITY_ENGAGEMENT = 'community_engagement',
  SPECIAL_EVENT = 'special_event'
}

export interface Reward {
  id: string;
  type: RewardType;
  title: string;
  description: string;
  points: number;
  imageUrl?: string;
  createdAt: number;
  expiresAt?: number;
  claimed: boolean;
  claimedAt?: number;
  userId: string;
}

export interface UserRewards {
  userId: string;
  totalPoints: number;
  level: number;
  rewards: Reward[];
  history: RewardHistory[];
}

export interface RewardHistory {
  id: string;
  rewardId: string;
  type: RewardType;
  points: number;
  timestamp: number;
  description: string;
}

export interface RewardTier {
  level: number;
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
}
