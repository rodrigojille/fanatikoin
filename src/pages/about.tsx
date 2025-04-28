import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import type { GetStaticProps } from 'next';

const About = () => {
  const { t } = useTranslation('common');

  return (
    <div className="bg-[rgb(10,15,35)] min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 text-white">
            About Fanatikoin
          </h1>
          <p className="text-xl text-gray-300">
            Revolutionizing Sports Fan Engagement Through Blockchain Technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Our Vision
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Fanatikoin was founded in 2024 by Rodrigo Jimenez with a vision to revolutionize how sports fans interact with their favorite teams. By leveraging blockchain technology on the Chiliz network, we're creating a new paradigm of fan engagement and team support.
            </p>
            <p className="text-lg text-gray-300">
              Our platform enables fans to own a piece of their team's success through digital tokens, providing unprecedented access to exclusive benefits and a real stake in their team's ecosystem.
            </p>
          </div>
          <div className="relative h-96">
            <Image
              src="/images/hero-image.jpg"
              alt="Fanatikoin Vision"
              fill
              className="object-cover rounded-lg shadow-xl"
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Innovation</h3>
              <p className="text-gray-300">
                Pushing the boundaries of what's possible in sports fan engagement
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Community</h3>
              <p className="text-gray-300">
                Building stronger connections between fans and teams
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Trust</h3>
              <p className="text-gray-300">
                Ensuring transparency and security in every transaction
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">
            Our Founder
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto mb-4 relative rounded-full border-4 border-[rgb(255,90,95)] shadow-lg">
                <Image
                  src="/images/founder.jpg"
                  alt="Rodrigo Jimenez"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-white">Rodrigo Jimenez</h3>
              <p className="text-[rgb(255,90,95)] font-semibold mb-4">
                Founder & CEO
              </p>
              <p className="text-lg text-gray-300">
                A visionary entrepreneur with over 15 years of experience in blockchain technology and sports management. Rodrigo founded Fanatikoin with the goal of bridging the gap between traditional sports fandom and the digital future.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    },
  };
};

export default About;
