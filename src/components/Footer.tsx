import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Fanatikoin</h3>
            <p className="text-gray-300">
              The best-in-class team token marketplace built on the Chiliz blockchain.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/marketplace" className="text-gray-300 hover:text-primary transition-colors">
                  Browse Tokens
                </Link>
              </li>
              <li>
                <Link href="/auctions" className="text-gray-300 hover:text-primary transition-colors">
                  Live Auctions
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-gray-300 hover:text-primary transition-colors">
                  Create Token
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/resources/faq" className="text-gray-300 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.chiliz.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Chiliz Chain
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://twitter.com/fanatikoin" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.gg/fanatikoin" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/fanatikoin" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Fanatikoin. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/legal/privacy" className="text-gray-400 hover:text-primary transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
