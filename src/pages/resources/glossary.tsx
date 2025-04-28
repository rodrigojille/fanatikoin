import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useState } from 'react';

export default function Glossary() {
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');

  // Get all glossary terms from the translation file
  const glossaryTerms = [
    'blockchain',
    'wallet',
    'privateKey',
    'publicKey',
    'gas',
    'gasless',
    'smartContract',
    'token',
    'fanToken',
    'chiliz',
    'web3',
    'web3auth',
    'biconomy',
    'nft',
    'defi',
    'dao',
    'metamask',
    'walletConnect',
    'chainId',
    'rpc'
  ];

  // Filter terms based on search
  const filteredTerms = glossaryTerms.filter(termKey => {
    const term = t(`glossary.terms.${termKey}.term`);
    const definition = t(`glossary.terms.${termKey}.definition`);
    return (
      term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Layout>
      <Head>
        <title>{t('glossary.meta.title')} | Fanatikoin</title>
        <meta name="description" content={t('glossary.meta.description')} />
        <meta name="keywords" content={t('glossary.meta.keywords')} />
        <meta property="og:title" content={t('glossary.meta.title')} />
        <meta property="og:description" content={t('glossary.meta.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/glossary-og.jpg" />
        <link rel="canonical" href="https://fanatikoin.com/resources/glossary" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('glossary.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('glossary.description')}
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((termKey) => (
              <div key={termKey} className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t(`glossary.terms.${termKey}.term`)}
                </h2>
                <p className="text-gray-600">
                  {t(`glossary.terms.${termKey}.definition`)}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {t('common.noResults')}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ locale = 'en' }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
