"use client";

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { motion, Variants } from 'framer-motion';
import { useWeb3 } from '@/context/Web3Context';
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Image from 'next/image';
import React from 'react';
import { formatNumber, formatCurrency } from '@/utils/format';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

interface TeamData {
  id: number;
  name: string;
  logo: string;
  price: string;
  supply: string;
  available: string;
}

interface Stat {
  value: string;
  label: string;
  description: string;
}

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const stagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Home: NextPage = () => {
  const { t } = useTranslation('common');
  const { connect, isConnecting, address } = useWeb3();

  const stats: Stat[] = [
    {
      value: '250K+',
      label: t('home.stats.users', 'Active Fans'),
      description: t('home.stats.users.description', 'Participating in team decisions')
    },
    {
      value: '$10M+',
      label: t('home.stats.volume', 'Trading Volume'),
      description: t('home.stats.volume.description', 'In the last 30 days')
    },
    {
      value: '18+',
      label: t('home.stats.teams', 'Teams'),
      description: t('home.stats.teams.description', 'With available tokens')
    }
  ];

  const features: Feature[] = [
    {
      icon: <ShieldCheckIcon className="h-6 w-6 text-white" />,
      title: t('home.features.secure.title', 'Security'),
      description: t('home.features.secure.description', 'Secure and transparent transactions'),
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: <CurrencyDollarIcon className="h-6 w-6 text-white" />,
      title: t('home.features.trade.title', 'Trading'),
      description: t('home.features.trade.description', 'Buy and sell tokens easily'),
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: <TrophyIcon className="h-6 w-6 text-white" />,
      title: t('home.features.rewards.title', 'Fan Governance'),
      description: t('home.features.rewards.description', 'Vote on team decisions and shape the future'),
      gradient: 'from-green-500 to-green-600'
    }
  ];

  const featuredTeams: TeamData[] = [
    {
      id: 1,
      name: 'FC Barcelona',
      logo: '/images/teams/barcelona-token.svg',
      price: '25 CHZ',
      supply: '1000000',
      available: '750000'
    },
    {
      id: 2,
      name: 'Manchester United',
      logo: '/images/teams/manchester-token.svg',
      price: '22 CHZ',
      supply: '1000000',
      available: '800000'
    },
    {
      id: 3,
      name: 'Juventus',
      logo: '/images/teams/juventus-token.svg',
      price: '20 CHZ',
      supply: '1000000',
      available: '600000'
    },
    {
      id: 4,
      name: 'Paris Saint-Germain',
      logo: '/images/teams/psg-token.svg',
      price: '23 CHZ',
      supply: '1000000',
      available: '700000'
    },
    {
      id: 5,
      name: 'Manchester City',
      logo: '/images/teams/mancity-token.svg',
      price: '24 CHZ',
      supply: '1000000',
      available: '650000'
    },
    {
      id: 6,
      name: 'Club América',
      logo: '/images/teams/america-token.svg',
      price: '18 CHZ',
      supply: '800000',
      available: '500000'
    },
    {
      id: 7,
      name: 'Chivas Guadalajara',
      logo: '/images/teams/chivas-token.svg',
      price: '17 CHZ',
      supply: '800000',
      available: '550000'
    },
    {
      id: 8,
      name: 'Diablos Rojos',
      logo: '/images/teams/diablos-token.svg',
      price: '15 CHZ',
      supply: '500000',
      available: '350000'
    },
    {
      id: 9,
      name: 'Toros de Tijuana',
      logo: '/images/teams/toros-token.svg',
      price: '14 CHZ',
      supply: '500000',
      available: '300000'
    }
  ];

  return (
    <>
            <div className="relative">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-black text-white">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent"></div>
            <div className="h-full w-full bg-[url('/images/hero-pattern.svg')] bg-cover bg-center"></div>
          </div>
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-left mb-12 lg:mb-0"
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                  <span className="block text-[rgb(255,90,95)]">{t('home.hero.title', 'Revolutionize')}</span>
                  <span className="block">{t('home.hero.subtitle', 'your passion for sports')}</span>
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mt-6 text-xl leading-8 text-gray-300 max-w-lg"
                >
                  {t('home.hero.description', 'Own a piece of your favorite team. Buy and sell fan tokens, vote on team decisions, and unlock exclusive experiences on the Chiliz blockchain.')}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-10 flex flex-wrap gap-4"
                >
                  {!address ? (
                    <Button
                      onClick={connect}
                      isLoading={isConnecting}
                      size="lg"
                      className="bg-[rgb(255,90,95)] hover:bg-[rgb(230,65,70)] text-white font-bold px-8 py-4 text-lg"
                    >
                      {t('connect.connectWallet', 'Connect Wallet')}
                    </Button>
                  ) : (
                    <Link href="/marketplace">
                      <Button
                        size="lg"
                        className="bg-[rgb(255,90,95)] hover:bg-[rgb(230,65,70)] text-white font-bold px-8 py-4 text-lg"
                      >
                        {t('marketplace.title', 'Explore Marketplace')}
                        <ArrowRightIcon className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  <Link href="#featured-teams">
                    <Button
                      size="lg"
                      className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold px-8 py-4 text-lg transition-colors duration-300"
                    >
                      {t('home.hero.discover', 'Discover Teams')}
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative hidden lg:block"
              >
                <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent z-10"></div>
                  <Image 
                    src="/images/team-token-animation.svg"
                    fetchPriority="high"
                    priority 
                    alt="Team Token Animation"
                    width={600}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                {t('home.stats.title', 'Fanatikoin in Numbers')}
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                {t('home.stats.subtitle', 'Join thousands of fans already participating in the future of sports engagement')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden p-8 border-t-4 border-[rgb(255,90,95)] bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-center">
                    <h3 className="text-5xl font-bold text-black">{stat.value}</h3>
                    <p className="mt-4 text-xl font-medium text-[rgb(255,90,95)]">{stat.label}</p>
                    <p className="mt-2 text-gray-600">{stat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="relative z-10 py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {t('home.features.title', 'Why Choose Us')}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
                {t('home.features.subtitle', 'Experience the future of sports fan engagement')}
              </p>
            </div>
            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="pt-6"
                  >
                    <div className="flow-root rounded-2xl bg-white px-6 pb-8 shadow-xl ring-1 ring-gray-900/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                      <div className="-mt-6">
                        <div className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r ${feature.gradient} p-3 shadow-lg`}>
                          {feature.icon}
                        </div>
                        <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                          {feature.title}
                        </h3>
                        <p className="mt-5 text-base text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Teams Section */}
        <div id="featured-teams" className="bg-gray-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
                {t('home.teams.title', 'Featured Teams')}
              </h2>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                {t('home.teams.subtitle', 'Invest in the best teams and be part of their journey')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTeams.map((team, index) => (
                <motion.div
                  key={team.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-64 bg-[#1a1a1a] overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-10"></div>
                    <Image
                      src={team.logo}
                      alt={`${team.name} Token`}
                      width={200}
                      height={200}
                      className="w-48 h-48 object-contain relative z-20"
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-black mb-4">{team.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500 mb-1">{t('home.teams.price', 'Price')}</p>
                        <p className="text-lg font-bold text-[rgb(255,90,95)]">{formatCurrency(team.price)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500 mb-1">{t('home.teams.available', 'Available')}</p>
                        <p className="text-lg font-bold text-black">{formatNumber(team.available)}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Link href={`/token/${team.id}`} className="flex-1">
                        <Button
                          className="w-full bg-[rgb(255,90,95)] hover:bg-[rgb(230,65,70)] text-white font-bold"
                          size="lg"
                        >
                          {t('home.teams.buyButton', 'Buy Token')}
                        </Button>
                      </Link>
                      <Link href={`/token/${team.id}`} className="flex-none">
                        <Button
                          className="aspect-square bg-black hover:bg-gray-800 text-white"
                          size="lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
                {t('home.howItWorks.title', 'How It Works')}
              </h2>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                {t('home.howItWorks.subtitle', 'Simple steps to start your journey with fan tokens')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative text-center px-6"
              >
                <div className="relative z-10 mb-8 mx-auto">
                  <div className="w-20 h-20 rounded-full bg-[rgb(255,90,95)] text-white flex items-center justify-center text-3xl font-bold mx-auto">
                    1
                  </div>
                  <div className="absolute top-10 left-full h-2 bg-[rgb(255,90,95)] w-full -ml-4 hidden md:block"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('home.howItWorks.step1.title', 'Connect Your Wallet')}</h3>
                <p className="text-gray-600">
                  {t('home.howItWorks.step1.description', 'Link your cryptocurrency wallet to access the Fanatikoin marketplace securely.')}
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative text-center px-6"
              >
                <div className="relative z-10 mb-8 mx-auto">
                  <div className="w-20 h-20 rounded-full bg-[rgb(255,90,95)] text-white flex items-center justify-center text-3xl font-bold mx-auto">
                    2
                  </div>
                  <div className="absolute top-10 left-full h-2 bg-[rgb(255,90,95)] w-full -ml-4 hidden md:block"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('home.howItWorks.step2.title', 'Choose Your Team')}</h3>
                <p className="text-gray-600">
                  {t('home.howItWorks.step2.description', 'Browse through our marketplace and select tokens from your favorite sports teams.')}
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative text-center px-6"
              >
                <div className="relative z-10 mb-8 mx-auto">
                  <div className="w-20 h-20 rounded-full bg-[rgb(255,90,95)] text-white flex items-center justify-center text-3xl font-bold mx-auto">
                    3
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('home.howItWorks.step3.title', 'Enjoy Benefits')}</h3>
                <p className="text-gray-600">
                  {t('home.howItWorks.step3.description', 'Unlock exclusive perks, participate in team decisions, and trade tokens in our marketplace.')}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden bg-black text-white py-24">
          <div className="absolute inset-0 z-0 opacity-30">
            <div className="h-full w-full bg-[url('/images/cta-pattern.svg')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-xl mb-12 lg:mb-0"
              >
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                  <span className="block text-[rgb(255,90,95)]">{t('home.cta.title', 'Join the')}</span>
                  <span className="block">{t('home.cta.titlePart2', 'revolution')}</span>
                </h2>
                <p className="text-xl leading-relaxed text-gray-300 mb-8">
                  {t('home.cta.description', 'Be part of the future of sports fandom. Connect your wallet and start trading team tokens today.')}
                </p>
                <div className="flex flex-wrap gap-4">
                  {!address ? (
                    <Button
                      onClick={connect}
                      isLoading={isConnecting}
                      className="bg-[rgb(255,90,95)] hover:bg-[rgb(230,65,70)] text-white font-bold px-8 py-4 text-lg"
                      size="lg"
                    >
                      {t('connect.connectWallet', 'Connect Wallet')}
                    </Button>
                  ) : (
                    <Link href="/marketplace">
                      <Button
                        className="bg-[rgb(255,90,95)] hover:bg-[rgb(230,65,70)] text-white font-bold px-8 py-4 text-lg"
                        size="lg"
                      >
                        {t('marketplace.title', 'Explore Marketplace')}
                      </Button>
                    </Link>
                  )}
                  <Link href="#how-it-works">
                    <Button
                      size="lg"
                      className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold px-8 py-4 text-lg transition-colors duration-300"
                    >
                      {t('home.cta.learnMore', 'Learn More')}
                    </Button>
                  </Link>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 gap-8 sm:grid-cols-2"
              >
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-colors duration-300">
                  <div className="rounded-full bg-[rgb(255,90,95)] p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <ShieldCheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {t('home.cta.feature1.title', 'Secure Transactions')}
                  </h3>
                  <p className="text-gray-300">
                    {t('home.cta.feature1.description', 'All transactions are secured by the Chiliz blockchain, ensuring transparency and security.')}
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-colors duration-300">
                  <div className="rounded-full bg-[rgb(255,90,95)] p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {t('home.cta.feature2.title', 'Community Benefits')}
                  </h3>
                  <p className="text-gray-300">
                    {t('home.cta.feature2.description', 'Token holders get exclusive access to team events, voting rights, and special merchandise.')}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    },
  };
};
