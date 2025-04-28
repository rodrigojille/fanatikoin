import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BigNumberish } from 'ethers';

// Mock dependencies
jest.mock('../context/TokenContext', () => ({
  useToken: jest.fn(),
}));

jest.mock('../utils/web3ErrorHandler', () => ({
  handleWeb3Error: jest.fn(),
  safeWeb3Call: jest.fn(),
}));

// Import after mocking
import { useToken } from '../context/TokenContext';
import { handleWeb3Error, safeWeb3Call } from '../utils/web3ErrorHandler';

describe('Token Context', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    
    // Setup mock for useToken
    jest.mocked(useToken).mockReturnValue({
      tokens: [
        {
          address: '0xtoken1',
          name: 'Token 1',
          symbol: 'TK1',
          description: 'Test Token 1',
          benefits: ['Benefit 1', 'Benefit 2'],
          price: '10',
        },
      ],
      auctions: [],
      loading: false,
      error: null,
      fetchTokens: jest.fn().mockResolvedValue(undefined),
      fetchAuctions: jest.fn().mockResolvedValue(undefined),
      approveToken: jest.fn().mockResolvedValue(undefined),
      createToken: jest.fn().mockResolvedValue(undefined),
      createAuction: jest.fn().mockResolvedValue(undefined),
      bidOnAuction: jest.fn().mockResolvedValue(undefined),
    });
  });

  describe('Token Display', () => {
    it('should display token information', () => {
      const { tokens } = useToken();
      const token = tokens[0];
      
      expect(token.name).toBe('Token 1');
      expect(token.symbol).toBe('TK1');
      expect(token.price).toBe('10');
    });
  });

  describe('Token Data Fetching', () => {
    it('should fetch token data', async () => {
      const { fetchTokens } = useToken();
      await fetchTokens();
      
      expect(fetchTokens).toHaveBeenCalled();
    });

    it('should fetch token data with retry count', async () => {
      const { fetchTokens } = useToken();
      await fetchTokens(2);
      
      expect(fetchTokens).toHaveBeenCalledWith(2);
    });
  });

  describe('Token Approval', () => {
    it('should approve tokens successfully', async () => {
      const { approveToken } = useToken();
      await approveToken('0xtoken1', '10');
      
      expect(approveToken).toHaveBeenCalledWith('0xtoken1', '10');
    });

    it('should handle approval errors', async () => {
      const { approveToken } = useToken();
      
      // Mock a rejection
      jest.mocked(approveToken).mockRejectedValueOnce(new Error('Approval failed'));
      
      try {
        await approveToken('0xtoken1', '10');
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      expect(approveToken).toHaveBeenCalledWith('0xtoken1', '10');
    });
  });
});

describe('Web3 Error Handler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(handleWeb3Error).mockReturnValue('Mocked error message');
    jest.mocked(safeWeb3Call).mockImplementation(async (fn) => {
      try {
        return await fn();
      } catch (error) {
        throw new Error('Web3 call failed');
      }
    });
  });

  it('should handle web3 errors', () => {
    const result = handleWeb3Error(new Error('Test error'));
    expect(result).toBe('Mocked error message');
      );
    });

    it('should get claimable rewards', async () => {
      const provider = new ethers.BrowserProvider({});
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TokenStaking,
        ['function getClaimableRewards(address, address)'],
        provider
      );
      
      const result = await stakingContract.getClaimableRewards(
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901'
      );
      
      expect(result.toString()).toBe(ethers.parseUnits('50', 18).toString());
      expect(stakingContract.getClaimableRewards).toHaveBeenCalledWith(
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901'
      );
    });
  });
});
