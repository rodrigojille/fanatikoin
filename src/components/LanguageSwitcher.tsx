"use client";

import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const LanguageSwitcher = () => {
  const router = useRouter();
  const { i18n } = useTranslation();

  const changeLanguage = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <div className="flex items-center">
      <div className="relative inline-flex rounded-md shadow-sm">
        <button
          className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-l-md border ${i18n.language === 'en' 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          onClick={() => changeLanguage('en')}
          aria-current={i18n.language === 'en' ? 'page' : undefined}
        >
          <span className="font-medium">EN</span>
        </button>
        <button
          className={`relative -ml-px inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-r-md border ${i18n.language === 'es' 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          onClick={() => changeLanguage('es')}
          aria-current={i18n.language === 'es' ? 'page' : undefined}
        >
          <span className="font-medium">ES</span>
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
