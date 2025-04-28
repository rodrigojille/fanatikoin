import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserToken } from '../../types/token';

interface TokenDashboardProps {
  tokens: UserToken[];
  totalValue: number;
}

const TokenDashboard: React.FC<TokenDashboardProps> = ({ tokens, totalValue }) => {
  // State for tracking which token's details are expanded
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  const toggleTokenDetails = (tokenAddress: string) => {
    if (expandedToken === tokenAddress) {
      setExpandedToken(null);
    } else {
      setExpandedToken(tokenAddress);
    }
  };

  // Calculate portfolio distribution percentages
  const calculatePercentage = (value: number) => {
    if (totalValue === 0) return 0;
    return (value / totalValue) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">Portfolio Overview</h2> // Ensures white text stands out on gradient background
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <span className="text-sm font-semibold text-white/90 drop-shadow">Total Value</span>
            <p className="text-2xl font-bold">{totalValue.toLocaleString()} CHZ</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <span className="text-sm font-semibold text-white/90 drop-shadow">Total Tokens</span>
            <p className="text-2xl font-bold">{tokens.length}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <span className="text-sm font-semibold text-white/90 drop-shadow">Top Token</span>
            <p className="text-2xl font-bold">
              {tokens.length > 0 ? tokens.reduce((prev, current) => 
                prev.totalValue > current.totalValue ? prev : current
              ).symbol : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Token distribution chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Portfolio Distribution</h3>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          {tokens.map((token, index) => {
            // Create a colorful distribution bar
            const colors = [
              'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
              'bg-red-500', 'bg-purple-500', 'bg-pink-500'
            ];
            const color = colors[index % colors.length];
            const percentage = calculatePercentage(token.totalValue);
            
            return (
              <div 
                key={token.address} 
                className={`h-full ${color} inline-block`} 
                style={{ width: `${percentage}%` }}
                title={`${token.name}: ${percentage.toFixed(1)}%`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4">
          {tokens.map((token, index) => {
            const colors = [
              'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
              'bg-red-500', 'bg-purple-500', 'bg-pink-500'
            ];
            const color = colors[index % colors.length];
            const percentage = calculatePercentage(token.totalValue);
            
            return (
              <div key={token.address} className="flex items-center">
                <div className={`w-3 h-3 ${color} rounded-full mr-2`}></div>
                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {token.symbol}: {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Token List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Tokens</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tokens.length > 0 ? (
            tokens.map((token) => (
              <div key={token.address} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {/* Replace with actual token image if available */}
                      <span className="font-bold text-lg">{token.symbol.substring(0, 2)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{token.name}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{token.symbol}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">{token.totalValue.toLocaleString()} CHZ</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Number(token.balance).toLocaleString()} tokens
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleTokenDetails(token.address)}
                  className="mt-2 text-sm text-primary hover:text-primary-dark flex items-center"
                >
                  {expandedToken === token.address ? 'Hide Details' : 'Show Details'}
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform ${expandedToken === token.address ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedToken === token.address && (
                  <div className="mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold mb-2">Token Details</h5>
                      <ul className="space-y-2 text-sm">
                        <li><span className="text-gray-500 dark:text-gray-400">Contract Address:</span> {token.address.substring(0, 8)}...{token.address.substring(token.address.length - 6)}</li>
                        <li><span className="text-gray-500 dark:text-gray-400">Current Price:</span> {token.price} CHZ</li>
                        <li><span className="text-gray-500 dark:text-gray-400">Your Balance:</span> {Number(token.balance).toLocaleString()} {token.symbol}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-2">Actions</h5>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/token/${token.address}`} className="btn-sm btn-primary">
                          View Token
                        </Link>
                        <Link href={`/marketplace?token=${token.address}`} className="btn-sm btn-secondary">
                          Trade
                        </Link>
                        <Link href={`/vote?token=${token.address}`} className="btn-sm btn-outline">
                          Governance
                        </Link>
                      </div>
                    </div>
                    
                    {/* Activity on this token */}
                    <div className="md:col-span-2 mt-2">
                      <h5 className="font-semibold mb-2">Recent Activity</h5>
                      <div className="text-sm">
                        <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">Yesterday</span>
                          <p>You received 5 {token.symbol} from the weekly distribution</p>
                        </div>
                        <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">5 days ago</span>
                          <p>You voted on team jersey design proposal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">No tokens found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You don't own any team tokens yet
              </p>
              <Link href="/marketplace" className="btn-primary">
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Governance and Voting Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Governance & Voting</h3>
        {tokens.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-semibold">New Team Captain Selection</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">FC Barcelona • Ends in 3 days</p>
                </div>
                <Link href="/vote/1" className="btn-sm btn-primary">
                  Vote Now
                </Link>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-semibold">Stadium Food Menu Choices</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manchester United • Ends in 5 days</p>
                </div>
                <Link href="/vote/2" className="btn-sm btn-primary">
                  Vote Now
                </Link>
              </div>
            </div>
            <Link href="/governance" className="text-sm text-primary hover:text-primary-dark flex items-center">
              View all governance proposals
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              You need to own team tokens to participate in governance
            </p>
            <Link href="/marketplace" className="btn-sm btn-primary">
              Get Tokens to Vote
            </Link>
          </div>
        )}
      </div>
      
      {/* Benefits & Rewards Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Benefits & Rewards</h3>
          <Link href="/rewards" className="text-sm text-primary hover:text-primary-dark">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h4 className="font-semibold">VIP Stadium Tour</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Unlock exclusive access to stadium tours with players</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">Requires: 100 BAR</span>
              <Link href="/rewards/1" className="text-xs text-primary hover:text-primary-dark">
                Learn More
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707a1 1 0 01-1.414 1.414l-.707-.707A1 1 0 0112 2zm-1 10a1 1 0 01.707.293l.707.707a1 1 0 11-1.414 1.414l-.707-.707A1 1 0 0111 12z" clipRule="evenodd" />
              </svg>
              <h4 className="font-semibold">Merchandise Discount</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">20% off all official team merchandise in the online store</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">Requires: 50 MUN</span>
              <Link href="/rewards/2" className="text-xs text-primary hover:text-primary-dark">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDashboard;
