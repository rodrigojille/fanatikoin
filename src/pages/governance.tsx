import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';

const governanceItems = [
  {
    title: 'Vote: FC Barcelona Next Captain',
    description: 'Vote on who should be the next team captain.',
    endsIn: '2 days',
    status: 'active',
  },
  {
    title: 'Proposal: Increase Fan Token Utility',
    description: 'Suggest new perks for token holders.',
    endsIn: '5 days',
    status: 'active',
  },
];

const Governance: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('governance.title', 'Governance & Voting')}</h1>
      <div className="space-y-6">
        {governanceItems.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('governance.endsIn', 'Ends in')}: {item.endsIn}</span>
              <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
                {item.status === 'active' ? t('governance.voteNow', 'Vote Now') : t('governance.closed', 'Closed')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Governance;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common']))
    }
  };
};
