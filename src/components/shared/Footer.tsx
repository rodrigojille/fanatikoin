import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaTwitter, FaDiscord, FaTelegram, FaMedium } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <FaTwitter className="h-6 w-6" />, href: 'https://x.com/fanatikoin', label: 'X' },
  ];

  const footerLinks = [
    {
      title: t('footer.about', 'About'),
      links: [
        { name: t('footer.about.about', 'About Us'), href: '/about' },
        { name: t('footer.about.founders', 'Founders'), href: '/founders' },
        { name: t('footer.about.contact', 'Contact'), href: '/contact' },
      ],
    },
    {
      title: t('footer.resources', 'Resources'),
      links: [
        { name: t('footer.resources.marketplace', 'Marketplace'), href: '/marketplace' },
        { name: t('footer.resources.auctions', 'Auctions'), href: '/auctions' },
        { name: t('footer.resources.faq', 'FAQ'), href: '/resources/faq' },
      ],
    },
    {
      title: t('footer.legal', 'Legal'),
      links: [
        { name: t('footer.legal.privacy', 'Privacy Policy'), href: '/legal/privacy' },
        { name: t('footer.legal.terms', 'Terms of Service'), href: '/legal/terms' },
        { name: t('footer.legal.cookies', 'Cookie Policy'), href: '/legal/cookies' },
      ],
    },
  ];

  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
              >
                Fanatikoin
              </motion.div>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              {t('footer.description', 'Empowering sports fans through blockchain technology. Own, trade, and vote with fan tokens.')}
            </p>
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-500"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links sections */}
          {footerLinks.map((section, index) => (
            <div key={index} className="col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-4">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © {currentYear} Tecnologias avanzadas centrales sapi de cv. {t('footer.rights', 'All rights reserved.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
