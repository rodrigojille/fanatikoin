import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Layout from '@/components/Layout';

const CreateReward = () => {
  const { t } = useTranslation('common');
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('team.createReward', 'Create New Reward')}</h1>
          <form className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-300" htmlFor="rewardName">{t('team.rewardName', 'Reward Name')}</label>
              <input id="rewardName" name="rewardName" type="text" className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-300" htmlFor="rewardDesc">{t('team.rewardDesc', 'Description')}</label>
              <textarea id="rewardDesc" name="rewardDesc" className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-300" htmlFor="requiredPoints">{t('team.requiredPoints', 'Required Points')}</label>
              <input id="requiredPoints" name="requiredPoints" type="number" min="0" className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <button type="submit" className="btn-primary w-full">{t('team.create', 'Create Reward')}</button>
            </div>
          </form>
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

export default CreateReward;
