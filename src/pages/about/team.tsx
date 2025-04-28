import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Layout from '@/components/Layout';

export default function Team() {
  const { t } = useTranslation('common');

  const team = [
    {
      name: 'John Smith',
      role: t('team.roles.ceo'),
      image: '/images/team/john-smith.jpg',
      bio: t('team.bios.john'),
    },
    {
      name: 'Maria Garcia',
      role: t('team.roles.cto'),
      image: '/images/team/maria-garcia.jpg',
      bio: t('team.bios.maria'),
    },
    // Add more team members as needed
  ];

  return (
    <Layout>
      <Head>
        <title>{t('team.meta.title')} | Fanatikoin</title>
        <meta name="description" content={t('team.meta.description')} />
        <meta name="keywords" content={t('team.meta.keywords')} />
        <meta property="og:title" content={t('team.meta.title')} />
        <meta property="og:description" content={t('team.meta.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/team-og.jpg" />
        <link rel="canonical" href="https://fanatikoin.com/about/team" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('team.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('team.description')}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div key={member.name} className="flex flex-col items-center">
              <div className="w-48 h-48 rounded-full overflow-hidden mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-blue-600 mb-2">{member.role}</p>
              <p className="text-gray-600 text-center">{member.bio}</p>
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
