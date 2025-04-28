import React from 'react';
import FanEngagement from '@/components/staking/FanEngagement';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';

const FanEngagementPage: React.FC = () => {
  const { t } = useTranslation('common');
  // Optionally pass a token or user prop here, or fetch with a hook
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('fanEngagement.title', 'Fan Engagement')}</h1>
      <FanEngagement token={null} onUpdate={() => {}} />
    </div>
  );
};

export default FanEngagementPage;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common']))
    }
  };
};
