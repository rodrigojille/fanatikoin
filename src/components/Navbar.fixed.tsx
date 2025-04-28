import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWeb3 } from '@/context/Web3Context';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import useSociosWallet from '@/hooks/useSociosWallet';

const Navbar = () => {
  const { t } = useTranslation('common');
  const { user, logout, login } = useAuth();
  const { connect, disconnect, address, isConnected, userInfo, isSocialLogin } = useWeb3();
  const { 
    isAvailable: isSociosAvailable, 
    connect: connectSocios, 
    address: sociosAddress,
    isConnected: isSociosConnected,
    error: sociosError
  } = useSociosWallet();
  
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConnectOptions, setShowConnectOptions] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);

  // Sync Web3Auth login with application authentication when using social login
  useEffect(() => {
    if (isSocialLogin && userInfo?.email && !user) {
      // If user is logged in with Web3Auth but not with our system, create a session
      const handleSocialLogin = async () => {
        try {
          console.log('[Web3Auth] Syncing social login with application auth');
          // Use email from Web3Auth as username/email
          if (userInfo.email) { // Check to make sure email isn't undefined
            await login({
              email: userInfo.email,
              password: '', // Password not needed for Web3Auth login
            }, true); // true flag indicates this is a social login
            console.log('[Web3Auth] Social login synced successfully');
          }
        } catch (error) {
          console.error('Error syncing Web3Auth login:', error);
        }
      };
      
      handleSocialLogin();
    }
  }, [isSocialLogin, userInfo, user, login]);
  
  // Log authentication state for debugging
  useEffect(() => {
    console.log('[Auth State] User:', user ? 'Logged in' : 'Not logged in');
    console.log('[Auth State] Web3:', isConnected ? 'Connected' : 'Not connected');
    console.log('[Auth State] Socios:', isSociosConnected ? 'Connected' : 'Not connected');
  }, [user, isConnected, isSociosConnected]);
  
  // Handle Socios Wallet errors
  useEffect(() => {
    if (sociosError) {
      console.error('[Socios Error]', sociosError);
    }
  }, [sociosError]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
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
            <Link href="/marketplace" className="hover:text-primary transition-colors">
              {t('marketplace', 'Marketplace')}
            </Link>
            <Link href="/auctions" className="hover:text-primary transition-colors">
              {t('auctions', 'Auctions')}
            </Link>
            <Link href="/staking" className="hover:text-primary transition-colors">
              {t('staking', 'Staking')}
            </Link>
            {user && (
              <>
                {(user.isAdmin || user.isTeam) && (
                  <Link href="/create" className="hover:text-primary transition-colors">
                    {t('create', 'Create')}
                  </Link>
                )}
                <Link href="/my-tokens" className="hover:text-primary transition-colors">
                  {t('myTokens', 'My Tokens')}
                </Link>
              </>
            )}
          </div>

          {/* Login/Register Buttons - Always visible and prominent */}
          <div className="flex items-center ml-auto space-x-2">
            {/* Always show Login/Register buttons if user is not logged in */}
            {!user && (
              <div className="flex space-x-2"> 
                <button
                  onClick={() => setShowLoginModal(true)}
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

            {/* Connect Wallet Button */}
            {!isConnected && !isSociosConnected ? (
              <button
                onClick={() => setShowConnectOptions(true)}
                className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded transition duration-200"
              >
                {t('connect.wallet', 'Connect Wallet')}
              </button>
            ) : (
              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                  {formatAddress(address || sociosAddress || '')}
                </span>
                <button
                  onClick={disconnect}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  {t('disconnect', 'Disconnect')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3">
            <div className="flex flex-col space-y-3 py-3 px-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Link href="/marketplace" className="hover:text-primary transition-colors px-3 py-2 rounded-md">
                {t('marketplace', 'Marketplace')}
              </Link>
              <Link href="/auctions" className="hover:text-primary transition-colors px-3 py-2 rounded-md">
                {t('auctions', 'Auctions')}
              </Link>
              <Link href="/staking" className="hover:text-primary transition-colors px-3 py-2 rounded-md">
                {t('staking', 'Staking')}
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
        
        {/* Connect wallet modal */}
        {showConnectOptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('connect.chooseWallet', 'Connect Wallet')}
              </h3>
              <div className="space-y-3">
                {/* Loading indicator */}
                {connectingWallet && (
                  <div className="flex justify-center items-center py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Connecting...</span>
                  </div>
                )}
                
                {/* Web3Auth option */}
                <button
                  onClick={async () => {
                    try {
                      setConnectingWallet(true);
                      setShowConnectOptions(false);
                      await connect();
                    } catch (error) {
                      console.error("[Wallet] Web3Auth connection error:", error);
                    } finally {
                      setConnectingWallet(false);
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
                  disabled={connectingWallet}
                >
                  <span>Web3Auth (Social Login)</span>
                </button>
                
                {/* Socios Wallet option - only show if available */}
                {isSociosAvailable && (
                  <button
                    onClick={async () => {
                      try {
                        setConnectingWallet(true);
                        setShowConnectOptions(false);
                        const address = await connectSocios();
                        if (address) {
                          console.log("[Wallet] Connected to Socios Wallet:", address);
                        }
                      } catch (error) {
                        console.error("[Wallet] Socios connection error:", error);
                      } finally {
                        setConnectingWallet(false);
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition duration-200"
                    disabled={connectingWallet}
                  >
                    <span>Socios Wallet</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowConnectOptions(false)}
                className="mt-4 w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}
        
        {/* Login modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('common.login', 'Login')}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    router.push('/login');
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  <span>{t('login.traditional', 'Traditional Login')}</span>
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                      {t('common.or', 'Or')}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={async () => {
                    setShowLoginModal(false);
                    try {
                      await connect(); // This triggers Web3Auth social login
                      console.log('[Web3Auth] Social login initiated');
                    } catch (error) {
                      console.error('[Web3Auth] Login error:', error);
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition duration-200"
                  aria-label="Login with Web3Auth"
                >
                  <span>{t('login.web3auth', 'Login with Web3Auth')}</span>
                </button>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="mt-4 w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
