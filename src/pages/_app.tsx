import '@/styles/globals.css';
import '@/styles/components/avatar.css';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Web3Provider from '@/context/Web3Context';
import { AuthProvider } from '@/context/AuthContext';
import { TokenProvider } from '@/context/TokenContext';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import PageContainer from '@/components/shared/PageContainer';
import Head from 'next/head';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  useAuth();
  return <>{children}</>;
}

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <title>Fanatikoin - Fan Token Marketplace</title>
        <meta name="description" content="Buy, sell, and trade fan tokens on the Chiliz blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1E40AF" />
        <meta property="og:title" content="Fanatikoin - Fan Token Marketplace" />
        <meta property="og:description" content="Buy, sell, and trade fan tokens on the Chiliz blockchain" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fanatikoin.com" />
        <meta property="og:image" content="https://fanatikoin.com/og-image.jpg" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <AuthProvider>
            <TokenProvider>
              <AuthWrapper>
                <PageContainer>
                  <Component {...pageProps} />
                </PageContainer>
              </AuthWrapper>
            </TokenProvider>
          </AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Web3Provider>
      </QueryClientProvider>
    </>
  );
}

export default appWithTranslation(App);
