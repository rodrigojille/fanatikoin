import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Layout from '@/components/Layout';

const ManageChallenges = () => {
  const { t } = useTranslation('common');
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('team.manageChallenges', 'Manage Challenges')}</h1>
          {/* Example challenge management table */}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('team.challenge', 'Challenge')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('team.points', 'Points')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2">{t('fanEngagement.challengeStake', 'Stake for 7 days')}</td>
                <td className="px-4 py-2">50</td>
                <td className="px-4 py-2">
                  <button className="btn-sm btn-primary mr-2">{t('common.edit', 'Edit')}</button>
                  <button className="btn-sm btn-secondary">{t('common.delete', 'Delete')}</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">{t('fanEngagement.challengeRefer', 'Refer a friend')}</td>
                <td className="px-4 py-2">100</td>
                <td className="px-4 py-2">
                  <button className="btn-sm btn-primary mr-2">{t('common.edit', 'Edit')}</button>
                  <button className="btn-sm btn-secondary">{t('common.delete', 'Delete')}</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">{t('fanEngagement.challengeSocial', 'Social media share')}</td>
                <td className="px-4 py-2">75</td>
                <td className="px-4 py-2">
                  <button className="btn-sm btn-primary mr-2">{t('common.edit', 'Edit')}</button>
                  <button className="btn-sm btn-secondary">{t('common.delete', 'Delete')}</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-6">
            <button className="btn-primary w-full">{t('team.addChallenge', 'Add New Challenge')}</button>
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

export default ManageChallenges;
