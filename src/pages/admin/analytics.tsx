import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { AnalyticsEventType, getEventsByType, getEventsByTimeRange } from '@/services/analyticsService';
import { useAuth } from '@/hooks/useAuth';

// Define the analytics data type
interface AnalyticsDataPoint {
  date: string;
  users: number;
  transactions: number;
  tokens: number;
}

// Mock data for charts
const generateMockData = (days: number): AnalyticsDataPoint[] => {
  const data: AnalyticsDataPoint[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 50) + 10,
      transactions: Math.floor(Math.random() * 30) + 5,
      tokens: Math.floor(Math.random() * 15) + 2,
    });
  }
  
  return data;
};

const AnalyticsDashboard: NextPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDataPoint[]>(generateMockData(7));
  
  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, isLoading, router]);
  
  // Update data when time range changes
  useEffect(() => {
    let days = 7;
    
    switch (timeRange) {
      case 'day':
        days = 1;
        break;
      case 'month':
        days = 30;
        break;
      default:
        days = 7;
    }
    
    setAnalyticsData(generateMockData(days));
  }, [timeRange]);
  
  if (isLoading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }
  
  if (!user || !user.isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <>
      <Head>
        <title>Analytics Dashboard | Fanatikoin</title>
        <meta name="description" content="Analytics dashboard for Fanatikoin platform" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
        
        {/* Time range selector */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setTimeRange('day')}
              className={`px-4 py-2 rounded ${
                timeRange === 'day' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded ${
                timeRange === 'week' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded ${
                timeRange === 'month' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
        
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{analyticsData.reduce((sum, day) => sum + day.users, 0)}</p>
            <p className="text-sm text-green-500 mt-2">
              +{Math.floor(Math.random() * 10) + 2}% from previous period
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold">{analyticsData.reduce((sum, day) => sum + day.transactions, 0)}</p>
            <p className="text-sm text-green-500 mt-2">
              +{Math.floor(Math.random() * 15) + 5}% from previous period
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Tokens Created</h3>
            <p className="text-3xl font-bold">{analyticsData.reduce((sum, day) => sum + day.tokens, 0)}</p>
            <p className="text-sm text-green-500 mt-2">
              +{Math.floor(Math.random() * 20) + 10}% from previous period
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Platform Revenue</h3>
            <p className="text-3xl font-bold">{(analyticsData.reduce((sum, day) => sum + day.transactions, 0) * 0.025).toFixed(2)} CHZ</p>
            <p className="text-sm text-green-500 mt-2">
              +{Math.floor(Math.random() * 12) + 8}% from previous period
            </p>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">User Activity</h3>
            <div className="h-64 flex items-end space-x-2">
              {analyticsData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t" 
                    style={{ height: `${(day.users / 50) * 100}%` }}
                  ></div>
                  <span className="text-xs mt-2 text-gray-600">{day.date.split('-')[2]}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction Volume</h3>
            <div className="h-64 flex items-end space-x-2">
              {analyticsData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-green-500 rounded-t" 
                    style={{ height: `${(day.transactions / 30) * 100}%` }}
                  ></div>
                  <span className="text-xs mt-2 text-gray-600">{day.date.split('-')[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent activity */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Mock data for recent activity */}
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {['Token Purchase', 'Wallet Connect', 'Token Creation', 'Auction Bid', 'User Login'][Math.floor(Math.random() * 5)]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      user{Math.floor(Math.random() * 1000)}@example.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      0x{Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(Date.now() - Math.random() * 86400000 * 3).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {['Purchased 100 tokens', 'Connected via Web3Auth', 'Created team token', 'Bid 50 CHZ', 'Login via email'][Math.floor(Math.random() * 5)]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Token performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Tokens</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change (24h)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Cap
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Mock data for token performance */}
                {['Barcelona', 'Manchester', 'Juventus', 'PSG', 'Arsenal'].map((team, index) => {
                  const price = (Math.random() * 10 + 1).toFixed(2);
                  const change = (Math.random() * 20 - 10).toFixed(2);
                  const volume = Math.floor(Math.random() * 10000 + 1000);
                  const marketCap = Math.floor(Math.random() * 1000000 + 100000);
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{team} Fan Token</div>
                            <div className="text-sm text-gray-500">{team.substring(0, 3).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {price} CHZ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          parseFloat(change) >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {change}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {volume.toLocaleString()} CHZ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {marketCap.toLocaleString()} CHZ
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default AnalyticsDashboard;
