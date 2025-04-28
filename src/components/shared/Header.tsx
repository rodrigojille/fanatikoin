"use client";

import React, { useState, useRef, useEffect, useContext } from 'react';
import Avatar from '../ui/Avatar';
import { useRouter } from 'next/router';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '@/context/Web3Context';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Menu } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  WalletIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  ClockIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Header = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { connect, disconnect, address, isConnecting, isCorrectChain } = useWeb3();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Diagnostic logs for debugging navigation/auth issues
  // eslint-disable-next-line no-console
  console.log('[Header] address:', address, '| user:', user, '| user.role:', user?.role, '| isCorrectChain:', isCorrectChain);

  // Track if Profile/Settings links will be rendered (for logging outside JSX)
  const shouldShowProfile = Boolean(user || address);
  const shouldShowSettings = Boolean(user || address);
  if (shouldShowProfile) {
    // eslint-disable-next-line no-console
    console.log('[Header] Will render Profile link (dropdown)');
  }
  if (shouldShowSettings) {
    // eslint-disable-next-line no-console
    console.log('[Header] Will render Settings link (dropdown)');
  }

  const navigation = React.useMemo(() => {
  if (!user && address) {
    // Optimistically show fan navigation if wallet is connected but user not loaded
    return [
      { name: t('navigation.marketplace', 'Marketplace'), href: '/marketplace', icon: <CurrencyDollarIcon className="h-5 w-5" /> },
      { name: t('navigation.auctions', 'Auctions'), href: '/auctions', icon: <TrophyIcon className="h-5 w-5" /> },
      { name: t('navigation.myTokens', 'My Tokens'), href: '/my-tokens', icon: <WalletIcon className="h-5 w-5" /> },
    ];
  }
  if (user?.role === 'admin') {
    return [
      { name: t('navigation.marketplace', 'Marketplace'), href: '/marketplace', icon: <CurrencyDollarIcon className="h-5 w-5" /> },
      { name: t('navigation.auctions', 'Auctions'), href: '/auctions', icon: <TrophyIcon className="h-5 w-5" /> },
      { name: t('navigation.myTokens', 'My Tokens'), href: '/my-tokens', icon: <WalletIcon className="h-5 w-5" /> },
      { name: t('navigation.createToken', 'Create Token'), href: '/create', icon: <ClockIcon className="h-5 w-5" /> },
      { name: t('navigation.team', 'Team'), href: '/team', icon: <UserCircleIcon className="h-5 w-5" /> },
      { name: t('navigation.admin', 'Admin'), href: '/admin', icon: <CogIcon className="h-5 w-5" /> },
    ];
  } else if (user?.role === 'team') {
    return [
      { name: t('navigation.team', 'Team'), href: '/team', icon: <UserCircleIcon className="h-5 w-5" /> },
      { name: t('navigation.createToken', 'Create Token'), href: '/create', icon: <ClockIcon className="h-5 w-5" /> },
      { name: t('navigation.myTokens', 'My Tokens'), href: '/my-tokens', icon: <WalletIcon className="h-5 w-5" /> },
      { name: t('navigation.marketplace', 'Marketplace'), href: '/marketplace', icon: <CurrencyDollarIcon className="h-5 w-5" /> },
      { name: t('navigation.auctions', 'Auctions'), href: '/auctions', icon: <TrophyIcon className="h-5 w-5" /> },
    ];
  } else if (user?.role === 'fan') {
    return [
      { name: t('navigation.marketplace', 'Marketplace'), href: '/marketplace', icon: <CurrencyDollarIcon className="h-5 w-5" /> },
      { name: t('navigation.auctions', 'Auctions'), href: '/auctions', icon: <TrophyIcon className="h-5 w-5" /> },
      { name: t('navigation.myTokens', 'My Tokens'), href: '/my-tokens', icon: <WalletIcon className="h-5 w-5" /> },
    ];
  } else {
    // Not logged in or no role
    return [
      { name: t('navigation.marketplace', 'Marketplace'), href: '/marketplace', icon: <CurrencyDollarIcon className="h-5 w-5" /> },
      { name: t('navigation.auctions', 'Auctions'), href: '/auctions', icon: <TrophyIcon className="h-5 w-5" /> },
    ];
  }
}, [t, user, address]);

// Debug: show navigation state
console.log('[Header] navigation:', navigation.map(n => n.name));

  return (
    <header className="sticky top-0 z-50">
      {/* Network Status Banner */}
      {isCorrectChain ? (
        <div className="bg-gradient-to-r from-green-500/90 to-green-600/90 text-white text-sm py-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse mr-2" />
            {t('network.connected', 'Connected to Chiliz Network')}
          </div>
        </div>
      ) : address ? (
        <div className="bg-gradient-to-r from-red-500/90 to-red-600/90 text-white text-sm py-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-red-300 animate-pulse mr-2" />
            {t('network.wrong', 'Please switch to Chiliz Network')}
          </div>
        </div>
      ) : null}

      {/* Main Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-2xl font-bold text-black group-hover:text-[rgb(255,90,95)] transition-colors duration-300"
                >
                  Fanatikoin
                </motion.div>
              </Link>

              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 text-black hover:text-[rgb(255,90,95)] px-3 py-2 text-sm font-medium transition-all duration-300 border-b-2 border-transparent hover:border-[rgb(255,90,95)]"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-6">
              <LanguageSwitcher />
              
              {!user && !address && (
                <div className="hidden md:flex space-x-3">
                  <Link href="/login">
                    <Button size="sm" className="border border-gray-300 text-gray-700 hover:bg-gray-50">
                      {t('common.login', 'Login')}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-[rgb(255,90,95)] hover:bg-[rgb(230,65,70)] text-white">
                      {t('common.register', 'Register')}
                    </Button>
                  </Link>
                </div>
              )}
              
              {address ? (
                <Menu as="div" className="relative">
                  <Menu.Button as={Button}
                    variant="secondary"
                    size="md"
                    className="flex items-center space-x-2"
                  >
                    <WalletIcon className="h-5 w-5" />
                    <span>{formatAddress(address)}</span>
                  </Menu.Button>

                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/profile"
                            className={`${active ? 'bg-[rgb(255,90,95)] text-white' : 'text-black'} group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer`}
                          >
                            <UserCircleIcon className="mr-2 h-5 w-5" />
                            {user?.username || t('navigation.profile', 'Profile')}
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/settings"
                            className={`${active ? 'bg-[rgb(255,90,95)] text-white' : 'text-black'} group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer`}
                          >
                            <CogIcon className="mr-2 h-5 w-5" />
                            {t('navigation.settings', 'Settings')}
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={disconnect}
                            className={`${active ? 'bg-[rgb(255,90,95)] text-white' : 'text-black'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          >
                            <WalletIcon className="mr-2 h-5 w-5" />
                            {t('connect.disconnect', 'Disconnect')}
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Menu>
              ) : (
                <Button
                  onClick={connect}
                  isLoading={isConnecting}
                  size="md"
                  className="bg-[rgb(255,90,95)] hover:bg-[rgb(230,65,70)] text-white font-bold"
                >
                  <WalletIcon className="h-5 w-5 mr-2" />
                  {t('connect.connectWallet', 'Connect Wallet')}
                </Button>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md text-black hover:text-[rgb(255,90,95)]"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white shadow-lg fixed left-0 right-0 z-50"
            >
              <div className="px-4 py-4 space-y-3 border-t border-gray-100">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-3 rounded-md text-base font-medium text-black hover:text-[rgb(255,90,95)] border-b border-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ))}
                {(user || address) && (
                  <div className="mt-4">
                    <Link
                      href="/profile"
                      className={`flex items-center justify-between px-4 py-3 rounded-t-md text-base font-medium border-b border-gray-100 ${router.pathname === '/profile' ? 'bg-primary text-white font-semibold' : 'text-black hover:text-[rgb(255,90,95)]'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar removed for sustainable type safety. Replace with icon or fallback if desired. */}
                        <span>{user?.username || (address ? formatAddress(address) : t('navigation.profile', 'Profile'))}</span>
                      </div>
                    </Link>
                    <Link
                      href="/settings"
                      className={`flex items-center justify-between px-4 py-3 rounded-b-md text-base font-medium border-b border-gray-100 ${router.pathname === '/settings' ? 'bg-primary text-white font-semibold' : 'text-black hover:text-[rgb(255,90,95)]'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <CogIcon className="h-5 w-5" />
                        <span>{t('navigation.settings', 'Settings')}</span>
                      </div>
                    </Link>
                  </div>
                )}
                <button
                  onClick={() => {
                    disconnect();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-md text-base font-medium text-[rgb(255,90,95)] hover:text-[rgb(230,65,70)] border-b border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <WalletIcon className="h-5 w-5" />
                    <span>{t('connect.disconnect', 'Disconnect')}</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

export default Header;
