import React, { useState, useEffect } from 'react';
import Avatar from './ui/Avatar';
import { useRouter } from 'next/router';
import '../../styles/components/avatar.css';
import Link from 'next/link';
import Image from 'next/image';
import { useWeb3 } from '@/context/Web3Context';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'next-i18next';
// import useSociosWallet from '@/hooks/useSociosWallet';

const Navbar = () => {
  const { t } = useTranslation('common');
  const { user, logout, login } = useAuth();
  const { connect, disconnect, address, isConnected, userInfo, isSocialLogin } = useWeb3();

  
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Cleaned up non-MetaMask wallet UI

  // Removed Web3Auth social login sync

  // Remove all modal and state for non-MetaMask wallets
  
  // Log authentication state for debugging
  useEffect(() => {
    console.log('[Auth State] User:', user ? 'Logged in' : 'Not logged in');
    console.log('[Auth State] Web3:', isConnected ? 'Connected' : 'Not connected');
  }, [user, isConnected]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav style={{ overflowX: 'hidden', maxWidth: '100%' }} className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Fanatikoin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 ml-8">
            {/* Fan Engagement Dropdown */}
            <div className="relative group">
              <button className="px-4 py-2 text-gray-700 dark:text-gray-200 font-semibold rounded inline-flex items-center focus:outline-none">
                <span>{t('navigation.fanEngagement.title', 'Fan Engagement')}</span>
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-50">
                <div className="py-1">
                  <Link href="/fan-engagement" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t('navigation.fanEngagement.dashboard', 'Dashboard')}</Link>
                  <Link href="/digital-merch" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t('navigation.fanEngagement.digitalMerch', 'Digital Merchandise & NFTs')}</Link>
                  <Link href="/stadium-experience" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t('navigation.fanEngagement.stadiumExperience', 'Stadium Experience')}</Link>
                  <Link href="/fan-content" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t('navigation.fanEngagement.fanContent', 'Fan Content & Monetization')}</Link>
                </div>
              </div>
            </div>
            <Link href="/marketplace" className="hover:text-primary transition-colors">
              {t('marketplace', 'Marketplace')}
            </Link>
            <Link href="/auctions" className="hover:text-primary transition-colors">
              {t('auctions', 'Auctions')}
            </Link>
            <Link href="/staking" className="hover:text-primary transition-colors">
              {t('staking', 'Staking')}
            </Link>
            <Link href="/founders" className="hover:text-primary transition-colors">
              {t('founders', 'Founders')}
            </Link>
            {(user || address) && (
              <>
                {user && (user.isAdmin || user.isTeam) && (
                  <Link href="/create" className="hover:text-primary transition-colors">
                    {t('create', 'Create')}
                  </Link>
                )}
                <Link href="/my-tokens" className="hover:text-primary transition-colors">
                  {t('myTokens', 'My Tokens')}
                </Link>
                {/* User dropdown for profile/settings, visible for both wallet and social login */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 hover:text-primary focus:outline-none">
                    <Avatar address={address} src={user?.avatarUrl !== null ? user.avatarUrl : undefined} size={24} />
                    <span className="flex items-center font-medium space-x-2">
                      <span>{user?.username || (address ? formatAddress(address) : t('profile', 'Profile'))}</span>
                    </span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-50">
                    <Link href="/profile" className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t ${router.pathname === '/profile' ? 'bg-primary text-white font-semibold' : ''}`}>{t('profile', 'Profile')}</Link>
                    <Link href="/settings" className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b ${router.pathname === '/settings' ? 'bg-primary text-white font-semibold' : ''}`}>{t('settings', 'Settings')}</Link>
                  </div>
                </div>
              </>
          </div>

          {/* Wallet Status */}
          <div className="flex items-center space-x-4">
            {address ? (
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {formatAddress(address || '')}
              </span>
            ) : (
              <button
                onClick={connect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                Connect MetaMask
              </button>
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center ml-auto space-x-3">
            {/* Language Switcher */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button className={`px-3 py-1 ${router.locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => router.push(router.asPath, router.asPath, { locale: 'en' })}>EN</button>
              <button className={`px-3 py-1 ${router.locale === 'es' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => router.push(router.asPath, router.asPath, { locale: 'es' })}>ES</button>
            </div>
            
            {/* Login/Register Buttons - Always visible and prominent */}
            {!user && (
              <div className="flex space-x-2"> 
                <button
                  onClick={() => router.push('/login')}
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  {t('common.login', 'Login')}
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-4 py-2 text-center transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  {t('common.register', 'Register')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3">
            <div className="flex flex-col space-y-3 py-3 px-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {/* Fan Engagement Section - Mobile */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                <span className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">{t('navigation.fanEngagement.title', 'Fan Engagement')}</span>
                <Link href="/fan-engagement" className="block px-3 py-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">{t('navigation.fanEngagement.dashboard', 'Dashboard')}</Link>
                <Link href="/digital-merch" className="block px-3 py-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">{t('navigation.fanEngagement.digitalMerch', 'Digital Merchandise & NFTs')}</Link>
                <Link href="/stadium-experience" className="block px-3 py-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">{t('navigation.fanEngagement.stadiumExperience', 'Stadium Experience')}</Link>
                <Link href="/fan-content" className="block px-3 py-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">{t('navigation.fanEngagement.fanContent', 'Fan Content & Monetization')}</Link>
              </div>
              <Link href="/marketplace" className="hover:text-primary transition-colors px-3 py-2 rounded-md">
                {t('marketplace', 'Marketplace')}
              </Link>
              <Link href="/auctions" className="hover:text-primary transition-colors px-3 py-2 rounded-md">
                {t('auctions', 'Auctions')}
              </Link>
              <Link href="/staking" className="hover:text-primary transition-colors px-3 py-2 rounded-md">
                {t('staking', 'Staking')}
              </Link>
              <Link href="/founders" className="hover:text-primary transition-colors px-3 py-2 rounded-md">
                {t('founders', 'Founders')}
              </Link>
              {user && (
                <>
                  {(user.isAdmin || user.isTeam) && (
                    <Link href="/create" className="hover:text-primary transition-colors px-3 py-2 rounded-md">
                      {t('create', 'Create')}
                    </Link>
                  )}
                  <Link href="/my-tokens" className="hover:text-primary transition-colors px-3 py-2 rounded-md">
                    {t('myTokens', 'My Tokens')}
                  </Link>
                  <Link href="/profile" className="hover:text-primary transition-colors px-3 py-2 rounded-md">
                    {t('profile', 'Profile')}
                  </Link>
                  <Link href="/settings" className="hover:text-primary transition-colors px-3 py-2 rounded-md">
                    {t('settings', 'Settings')}
                  </Link>
                </>
              )}
              {!user && (
                <div className="flex flex-col space-y-2 mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200 w-full text-center"
                  >
                    {t('login', 'Login')}
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition duration-200 w-full text-center"
                  >
                    {t('register', 'Register')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
