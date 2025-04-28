import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

export default function Privacy() {
  const { t } = useTranslation('common');

  return (
    <div>
      <Head>
        <title>{t('privacy.meta.title')} | Fanatikoin</title>
        <meta name="description" content={t('privacy.meta.description')} />
        <meta name="keywords" content={t('privacy.meta.keywords')} />
        <meta property="og:title" content={t('privacy.meta.title')} />
        <meta property="og:description" content={t('privacy.meta.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/privacy-og.jpg" />
        <link rel="canonical" href="https://fanatikoin.com/legal/privacy" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {t('privacy.title')}
        </h1>

        <p className="text-gray-600 mb-8">{t('privacy.lastUpdated')}</p>
        <p className="text-gray-800 mb-8">{t('privacy.introduction')}</p>

        <div className="prose prose-blue max-w-none">
          <section>
            <h2>{t('privacy.sections.collection.title')}</h2>
            <p>{t('privacy.sections.collection.content')}</p>
          </section>

          <section className="mt-8">
            <h2>{t('privacy.sections.use.title')}</h2>
            <p>{t('privacy.sections.use.content')}</p>
          </section>

          <section className="mt-8">
            <h2>{t('privacy.sections.sharing.title')}</h2>
            <p>{t('privacy.sections.sharing.content')}</p>
          </section>

          <section className="mt-8">
            <h2>{t('privacy.sections.security.title')}</h2>
            <p>{t('privacy.sections.security.content')}</p>
          </section>

          <section className="mt-8">
            <h2>{t('privacy.sections.cookies.title')}</h2>
            <p>{t('privacy.sections.cookies.content')}</p>
          </section>

          <section className="mt-8">
            <h2>{t('privacy.sections.rights.title')}</h2>
            <p>{t('privacy.sections.rights.content')}</p>
          </section>

          <section className="mt-8">
            <h2>{t('privacy.sections.contact.title')}</h2>
            <p>{t('privacy.sections.contact.content')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale = 'en' }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
