import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const HelpCenter: NextPage = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>Help Center | Fanatikoin</title>
        <meta name="description" content="Get help with Fanatikoin - the fan token platform on Chiliz Chain" />
      </Head>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Help Center</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/resources/faq" className="text-primary hover:underline">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <a href="#wallet-setup" className="text-primary hover:underline">
                  Setting up your wallet
                </a>
              </li>
              <li>
                <a href="#buying-tokens" className="text-primary hover:underline">
                  How to buy tokens
                </a>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Account & Security</h2>
            <ul className="space-y-2">
              <li>
                <a href="#account-setup" className="text-primary hover:underline">
                  Creating an account
                </a>
              </li>
              <li>
                <a href="#security-tips" className="text-primary hover:underline">
                  Security best practices
                </a>
              </li>
              <li>
                <a href="#password-reset" className="text-primary hover:underline">
                  Resetting your password
                </a>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Marketplace</h2>
            <ul className="space-y-2">
              <li>
                <a href="#buying-guide" className="text-primary hover:underline">
                  Buying tokens guide
                </a>
              </li>
              <li>
                <a href="#selling-guide" className="text-primary hover:underline">
                  Selling tokens guide
                </a>
              </li>
              <li>
                <a href="#auction-guide" className="text-primary hover:underline">
                  Participating in auctions
                </a>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Blockchain Basics</h2>
            <ul className="space-y-2">
              <li>
                <a href="#blockchain-intro" className="text-primary hover:underline">
                  Introduction to blockchain
                </a>
              </li>
              <li>
                <a href="#chiliz-chain" className="text-primary hover:underline">
                  About Chiliz Chain
                </a>
              </li>
              <li>
                <a href="#gas-fees" className="text-primary hover:underline">
                  Understanding gas fees
                </a>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
            <ul className="space-y-2">
              <li>
                <a href="#connection-issues" className="text-primary hover:underline">
                  Wallet connection issues
                </a>
              </li>
              <li>
                <a href="#transaction-errors" className="text-primary hover:underline">
                  Transaction errors
                </a>
              </li>
              <li>
                <a href="#missing-tokens" className="text-primary hover:underline">
                  Missing tokens
                </a>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
            <p className="mb-4">Need more help? Our support team is ready to assist you.</p>
            <Link 
              href="/contact" 
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6" id="wallet-setup">Setting up your wallet</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="mb-4">
              To interact with the Fanatikoin platform, you'll need a Web3 wallet. We recommend using Web3Auth for the best experience.
            </p>
            
            <h3 className="text-lg font-semibold mb-2">Steps to set up your wallet:</h3>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>Click on the "Connect Wallet" button in the navigation bar</li>
              <li>Choose your preferred login method (Google, Facebook, etc.)</li>
              <li>Complete the authentication process</li>
              <li>Your wallet will be automatically created and connected</li>
            </ol>
            
            <p className="mb-4">
              Alternatively, you can use other wallets like MetaMask by following these steps:
            </p>
            
            <ol className="list-decimal pl-6 space-y-2">
              <li>Install the MetaMask extension from the official website</li>
              <li>Create a new wallet or import an existing one</li>
              <li>Add the Chiliz Chain network (Chain ID: 1001)</li>
              <li>Connect your wallet to Fanatikoin</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default HelpCenter;
