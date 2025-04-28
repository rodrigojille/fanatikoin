import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/context/Web3Context';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';

// Mock data for auctions - in a real app, this would come from an API or blockchain
const mockAuctions = {
  '1': {
    id: 1,
    name: 'Limited Edition FC Barcelona Token',
    tokenSymbol: 'BAR-LE',
    currentBid: 500,
    minBidIncrement: 50,
    image: '/auctions/barcelona-limited.png',
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    description: 'Limited edition token with exclusive perks for FC Barcelona fans. This token grants holders special access to club events, merchandise discounts, and voting rights on certain club decisions.',
    totalBids: 12,
    bidHistory: [
      { bidder: '0x1234...5678', amount: 500, time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { bidder: '0x8765...4321', amount: 450, time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
      { bidder: '0x5678...1234', amount: 400, time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() }
    ],
    benefits: [
      'Exclusive access to FC Barcelona training sessions',
      'VIP match tickets opportunity',
      'Limited edition digital collectibles',
      'Meet and greet with players (random selection)'
    ]
  },
  '2': {
    id: 2,
    name: 'Manchester United Founder Token',
    tokenSymbol: 'MUN-FT',
    currentBid: 750,
    minBidIncrement: 75,
    image: '/auctions/manchester-founder.png',
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    description: 'Founder token with lifetime benefits for Manchester United fans. This token grants holders exclusive access to club events, merchandise discounts, and voting rights on certain club decisions.',
    totalBids: 18,
    bidHistory: [
      { bidder: '0x9876...5432', amount: 750, time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { bidder: '0x5432...9876', amount: 675, time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { bidder: '0x2468...1357', amount: 600, time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() }
    ],
    benefits: [
      'Lifetime priority access to home matches',
      'Annual exclusive merchandise pack',
      'Voting rights on certain club decisions',
      'Access to private club events'
    ]
  },
  '3': {
    id: 3,
    name: 'Juventus VIP Token',
    tokenSymbol: 'JUV-VIP',
    currentBid: 600,
    minBidIncrement: 60,
    image: '/auctions/juventus-vip.png',
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    description: 'VIP token with exclusive access to Juventus events and merchandise. This token grants holders special access to club events, merchandise discounts, and voting rights on certain club decisions.',
    totalBids: 15,
    bidHistory: [
      { bidder: '0x1357...2468', amount: 600, time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { bidder: '0x2468...1357', amount: 540, time: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() },
      { bidder: '0x3579...2468', amount: 480, time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }
    ],
    benefits: [
      'VIP stadium tours with club legends',
      'Exclusive merchandise discounts',
      'Priority access to ticket sales',
      'Digital collectibles from historic moments'
    ]
  }
};

const AuctionDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isConnected, connect, account } = useWeb3();
  const [bidAmount, setBidAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get auction data based on ID
  const auction = id ? mockAuctions[id as string] : null;

  // Update time remaining
  useEffect(() => {
    if (!auction) return;

    const updateTimeRemaining = () => {
      const endTime = new Date(auction.endTime).getTime();
      const now = Date.now();
      const diff = endTime - now;
      
      if (diff <= 0) {
        setTimeRemaining('Auction ended');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [auction]);

  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBidAmount(e.target.value);
    setErrorMessage('');
  };

  const handlePlaceBid = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    if (!auction) return;

    const amount = parseFloat(bidAmount);
    
    // Validate bid amount
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid bid amount');
      return;
    }
    
    if (amount < auction.currentBid + auction.minBidIncrement) {
      setErrorMessage(`Bid must be at least ${auction.currentBid + auction.minBidIncrement} CHZ`);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // In a real app, this would call a smart contract function
      // For demo purposes, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Bid successful
      setBidSuccess(true);
      
      // Reset after showing success message
      setTimeout(() => {
        setBidSuccess(false);
        setBidAmount('');
      }, 3000);
    } catch (error) {
      console.error('Bid failed:', error);
      setErrorMessage('Bid failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for bid history
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };

  if (!auction) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading auction details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Auction Image */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex items-center justify-center">
        <div className="text-4xl font-bold text-gray-400">{auction.name}</div>
      </div>

      {/* Auction Details */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{auction.name}</h1>
          <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
            {auction.tokenSymbol}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">{auction.description}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Benefits</h3>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
            {auction.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>

        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Bid</p>
              <p className="text-2xl font-bold">{auction.currentBid} CHZ</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Minimum Increment</p>
              <p className="text-lg font-semibold">{auction.minBidIncrement} CHZ</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time Remaining</p>
            <div className="bg-primary bg-opacity-10 text-primary px-4 py-2 rounded-md font-bold">
              {timeRemaining}
            </div>
          </div>

          {timeRemaining !== 'Auction ended' && (
            <>
              <div className="flex items-center space-x-4 mb-4">
                <input
                  type="number"
                  placeholder={`Min bid: ${auction.currentBid + auction.minBidIncrement} CHZ`}
                  value={bidAmount}
                  onChange={handleBidAmountChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handlePlaceBid}
                  disabled={isLoading}
                  className={`btn-primary whitespace-nowrap ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : !isConnected ? 'Connect Wallet' : 'Place Bid'}
                </button>
              </div>

              {errorMessage && (
                <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                  {errorMessage}
                </div>
              )}

              {bidSuccess && (
                <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
                  Bid placed successfully! You are now the highest bidder.
                </div>
              )}
            </>
          )}
        </div>

        {/* Bid History */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Bid History</h3>
          {auction.bidHistory.length > 0 ? (
            <div className="space-y-4">
              {auction.bidHistory.map((bid, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div>
                    <p className="font-semibold">{formatAddress(bid.bidder)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(bid.time)}</p>
                  </div>
                  <div className="text-xl font-bold">{bid.amount} CHZ</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No bids yet. Be the first to bid!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale = 'en' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    },
  };
};

export default AuctionDetail;
