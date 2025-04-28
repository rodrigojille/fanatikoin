export interface UserToken {
  address: string;
  name: string;
  symbol: string;
  balance: bigint;
  price: number;
  description: string;
  totalValue: number;
  // Additional fields inspired by Socios.com
  imageUrl?: string;
  teamId?: string;
  votingPower?: number;
  voteParticipation?: number;
  lastDistribution?: string;
  benefits?: TokenBenefit[];
}

export interface TokenBenefit {
  id: string;
  name: string;
  description: string;
  requiredAmount: number;
  imageUrl?: string;
  category: 'vip' | 'merchandise' | 'experience' | 'digital' | 'other';
  expiryDate?: string;
}

export interface TokenVote {
  id: string;
  title: string;
  description: string;
  tokenAddress: string;
  tokenSymbol: string;
  endDate: string;
  options: VoteOption[];
  status: 'active' | 'completed' | 'upcoming';
}

export interface VoteOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface TokenActivity {
  id: string;
  type: 'purchase' | 'sale' | 'distribution' | 'vote' | 'benefit' | 'staking' | 'other';
  tokenAddress: string;
  tokenSymbol: string;
  amount?: number;
  price?: number;
  timestamp: string;
  description: string;
  transactionHash?: string;
}

export interface TokenStaking {
  tokenAddress: string;
  tokenSymbol: string;
  stakedAmount: bigint;
  rewards: bigint;
  lockPeriod: number; // in seconds
  startTime: string;
  endTime: string;
  apy: number;
}
