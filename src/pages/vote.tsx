import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';

const voteItems = [
  {
    question: 'Should we launch a new fan token for Real Madrid?',
    options: ['Yes', 'No', 'Abstain'],
    endsIn: '1 day',
    status: 'active',
  },
  {
    question: 'Select the next team event for FC Barcelona',
    options: ['Meet & Greet', 'Stadium Tour', 'Online AMA'],
    endsIn: '3 days',
    status: 'active',
  },
];

const Vote: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('vote.title', 'Community Voting')}</h1>
      <div className="space-y-6">
        {voteItems.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{item.question}</h2>
            <div className="mb-4">
              {item.options.map((opt, i) => (
                <button key={i} className="mr-2 mb-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('vote.endsIn', 'Ends in')}: {item.endsIn}</span>
              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">{item.status === 'active' ? t('vote.active', 'Active') : t('vote.closed', 'Closed')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vote;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common']))
    }
  };
};
