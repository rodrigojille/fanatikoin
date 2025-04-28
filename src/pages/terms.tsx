import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Terms: NextPage = () => {
  const { t } = useTranslation('common');
  
  return (
    <>
      <Head>
        <title>{t('terms.meta.title')} | Fanatikoin</title>
        <meta name="description" content={t('terms.meta.description')} />
        <meta name="keywords" content={t('terms.meta.keywords')} />
        <meta property="og:title" content={t('terms.meta.title')} />
        <meta property="og:description" content={t('terms.meta.description')} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://fanatikoin.com/terms" />
      </Head>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{t('terms.title')}</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="mb-4 text-gray-600">{t('terms.lastUpdated')}</p>
          
          <div className="prose max-w-none">
            <h2>{t('terms.sections.acceptance.title')}</h2>
            <p>{t('terms.sections.acceptance.content')}</p>
            
            <h2>{t('terms.sections.description.title')}</h2>
            <p>{t('terms.sections.description.content')}</p>
            
            <h2>{t('terms.sections.registration.title')}</h2>
            <p>{t('terms.sections.registration.content')}</p>
            
            <h2>{t('terms.sections.conduct.title')}</h2>
            <p>{t('terms.sections.conduct.content')}</p>
            
            <h2>{t('terms.sections.blockchain.title')}</h2>
            <p>{t('terms.sections.blockchain.content')}</p>
            
            <h2>{t('terms.sections.fees.title')}</h2>
            <p>{t('terms.sections.fees.content')}</p>
            
            <h2>{t('terms.sections.intellectual.title')}</h2>
            <p>{t('terms.sections.intellectual.content')}</p>
            
            <h2>{t('terms.sections.userContent.title')}</h2>
            <p>{t('terms.sections.userContent.content')}</p>
            
            <h2>{t('terms.sections.disclaimer.title')}</h2>
            <p>{t('terms.sections.disclaimer.content')}</p>
            
            <h2>{t('terms.sections.limitation.title')}</h2>
            <p>{t('terms.sections.limitation.content')}</p>
            
            <h2>{t('terms.sections.indemnification.title')}</h2>
            <p>{t('terms.sections.indemnification.content')}</p>
            
            <h2>{t('terms.sections.governing.title')}</h2>
            <p>{t('terms.sections.governing.content')}</p>
            
            <h2>{t('terms.sections.changes.title')}</h2>
            <p>{t('terms.sections.changes.content')}</p>
            
            <h2>{t('terms.sections.contact.title')}</h2>
            <p>{t('terms.sections.contact.content')}</p>
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

export default Terms;
