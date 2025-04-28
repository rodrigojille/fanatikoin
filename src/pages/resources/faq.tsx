import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useState } from 'react';

export default function FAQ() {
  const { t } = useTranslation('common');
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const faqs = [
    {
      question: t('faq.questions.what.question'),
      answer: t('faq.questions.what.answer'),
    },
    {
      question: t('faq.questions.how.question'),
      answer: t('faq.questions.how.answer'),
    },
    {
      question: t('faq.questions.benefits.question'),
      answer: t('faq.questions.benefits.answer'),
    },
    {
      question: t('faq.questions.buy.question'),
      answer: t('faq.questions.buy.answer'),
    },
    {
      question: t('faq.questions.secure.question'),
      answer: t('faq.questions.secure.answer'),
    },
    {
      question: t('faq.questions.wallet.question'),
      answer: t('faq.questions.wallet.answer'),
    },
    {
      question: t('faq.questions.sell.question'),
      answer: t('faq.questions.sell.answer'),
    },
    {
      question: t('faq.questions.biconomy.question'),
      answer: t('faq.questions.biconomy.answer'),
    },
  ];

  return (
    <Layout>
      <Head>
        <title>{t('faq.meta.title')} | Fanatikoin</title>
        <meta name="description" content={t('faq.meta.description')} />
        <meta name="keywords" content={t('faq.meta.keywords')} />
        <meta property="og:title" content={t('faq.meta.title')} />
        <meta property="og:description" content={t('faq.meta.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/faq-og.jpg" />
        <link rel="canonical" href="https://fanatikoin.com/resources/faq" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('faq.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('faq.description')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
              >
                <span className="text-lg font-medium text-gray-900">
                  {faq.question}
                </span>
                <span className="ml-6">
                  <svg
                    className={`w-6 h-6 transform ${
                      openQuestion === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              {openQuestion === index && (
                <div className="px-6 py-4 bg-gray-50">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
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
