import React from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/context/AuthContext';
import { useWeb3 } from '@/context/Web3Context';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const AdminPage = () => {
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuth();
  const { isInitializing } = useWeb3();
  const router = useRouter();

  React.useEffect(() => {
    console.log('[Admin] Auth state:', { isInitializing, isAuthenticated, isAdmin: user?.isAdmin });
    if (!isInitializing && (!isAuthenticated || !user?.isAdmin)) {
      console.log('[Admin] Not authenticated or not admin, redirecting to home');
      router.push('/');
    }
  }, [isAuthenticated, isInitializing, user, router]);

  if (isInitializing) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(255,90,95)]"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user || !user.isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6">{t('admin.title', 'Admin Dashboard')}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t('admin.totalUsers', 'Total Users')}</h3>
              <p className="text-3xl font-bold text-indigo-600">1,234</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t('admin.activeTokens', 'Active Tokens')}</h3>
              <p className="text-3xl font-bold text-indigo-600">45</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t('admin.totalTransactions', 'Total Transactions')}</h3>
              <p className="text-3xl font-bold text-indigo-600">5,678</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t('admin.revenue', 'Revenue (CHZ)')}</h3>
              <p className="text-3xl font-bold text-indigo-600">89,012</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">{t('admin.recentTransactions', 'Recent Transactions')}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.transactionId', 'Transaction ID')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.user', 'User')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.amount', 'Amount')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.status', 'Status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TX123456</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0x1234...5678</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100 CHZ</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {t('admin.completed', 'Completed')}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">{t('admin.systemStatus', 'System Status')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">{t('admin.contractStatus', 'Smart Contract Status')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('admin.mainContract', 'Main Contract')}</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {t('admin.active', 'Active')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('admin.tokenContract', 'Token Contract')}</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {t('admin.active', 'Active')}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">{t('admin.networkStatus', 'Network Status')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('admin.gasPrice', 'Gas Price')}</span>
                      <span className="text-sm font-medium">25 Gwei</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('admin.blockNumber', 'Block Number')}</span>
                      <span className="text-sm font-medium">#12345678</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    },
  };
};

export default AdminPage;
