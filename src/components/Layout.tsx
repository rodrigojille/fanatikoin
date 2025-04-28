import React, { ReactNode, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { useWeb3 } from '@/context/Web3Context';
import ErrorBoundary from './ErrorBoundary';
import LoadingOverlay from './ui/LoadingOverlay';
import Header from './shared/Header';

// Ethereum provider types are defined in src/types/ethereum.d.ts

interface LayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNavigation = false }) => {
  const { t } = useTranslation('common');
  const { 
    address, 
    connect, 
    disconnect, 
    isConnecting, 
    isCorrectChain, 
    loading,
    hasPreviousSession,
    reconnectLastWallet
  } = useWeb3();
  
  // Attempt to reconnect to previous wallet session
  useEffect(() => {
    if (hasPreviousSession && !address) {
      console.log('[Layout] Detected previous session, attempting to reconnect');
      reconnectLastWallet();
    }
  }, [hasPreviousSession, address, reconnectLastWallet]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Head>
          <title>Fanatikoin - Team Token Marketplace</title>
          <meta name="description" content="Buy, sell, and trade team tokens on the Chiliz blockchain" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <LoadingOverlay 
          isLoading={loading.isLoading} 
          message={loading.message || t('common.loading', 'Loading...')}
        >
          <main className="flex-grow py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </LoadingOverlay>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
