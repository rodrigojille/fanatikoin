import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Layout from '@/components/Layout';

const Analytics = () => {
  const { t } = useTranslation('common');
  // Example stats (replace with real analytics data)
  const stats = [
    { label: t('team.analyticsHolders', 'Fan Token Holders'), value: 1234 },
    { label: t('team.analyticsEngagement', 'Engagement Rate'), value: '78%' },
    { label: t('team.analyticsRewardsClaimed', 'Rewards Claimed'), value: 321 },
    { label: t('team.analyticsChallengesCompleted', 'Challenges Completed'), value: 456 },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('team.analyticsTitle', 'Fan Token Holder Analytics')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center">
                <span className="text-lg text-gray-500 dark:text-gray-300 mb-2">{stat.label}</span>
                <span className="text-3xl font-bold text-primary">{stat.value}</span>
              </div>
            ))}
          </div>
          {/* Placeholder for analytics charts */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 flex flex-col items-center">
            <span className="text-gray-600 dark:text-gray-200 mb-2">{t('team.analyticsCharts', 'Analytics charts coming soon...')}</span>
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

export default Analytics;
