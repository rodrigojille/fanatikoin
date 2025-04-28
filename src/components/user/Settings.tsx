import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWeb3 } from '@/context/Web3Context';
import { useTranslation } from 'next-i18next';

interface SettingsForm {
  notifications: {
    email: boolean;
    push: boolean;
    auction: boolean;
    price: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    currency: 'CHZ' | 'USD' | 'EUR';
  };
}

export default function Settings() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { address, isCorrectChain } = useWeb3();
  const [settings, setSettings] = useState<SettingsForm>({
    notifications: {
      email: true,
      push: true,
      auction: true,
      price: true,
    },
    display: {
      theme: 'system',
      currency: 'CHZ',
    },
  });

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        email: user?.settings?.notifications?.email ?? prev.notifications.email,
        push: user?.settings?.notifications?.push ?? prev.notifications.push,
        auction: user?.settings?.notifications?.auction ?? prev.notifications.auction,
        price: user?.settings?.notifications?.price ?? prev.notifications.price,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleDisplayChange = (key: keyof typeof settings.display, value: string) => {
    setSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [key]: value,
      },
    }));
  };

  // Show settings if either user.walletAddress or connected wallet address is present
  if (!(user?.walletAddress || address)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-xl text-gray-600">{t('settings.connectWalletMessage', 'Please connect your wallet to access settings')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('settings.title', 'Settings')}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {t('settings.subtitle', 'Manage your notification and display preferences')}
          </p>
        </div>

        <div className="border-t border-gray-200">
          {/* Notifications Section */}
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">{t('settings.notifications.title', 'Notifications')}</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="email-notifications" className="text-sm text-gray-700">
                  {t('settings.notifications.email', 'Email Notifications')}
                </label>
                <button
                  id="email-notifications"
                  type="button"
                  aria-label="Email Notifications"
                  onClick={() => handleNotificationChange('email')}
                  className={`${
                    settings.notifications.email ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="push-notifications" className="text-sm text-gray-700">
                  {t('settings.notifications.push', 'Push Notifications')}
                </label>
                <button
                  id="push-notifications"
                  type="button"
                  aria-label="Push Notifications"
                  onClick={() => handleNotificationChange('push')}
                  className={`${
                    settings.notifications.push ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="auction-notifications" className="text-sm text-gray-700">
                  {t('settings.notifications.auction', 'Auction Alerts')}
                </label>
                <button
                  id="auction-notifications"
                  type="button"
                  aria-label="Auction Updates"
                  onClick={() => handleNotificationChange('auction')}
                  className={`${
                    settings.notifications.auction ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.notifications.auction ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="price-notifications" className="text-sm text-gray-700">
                  {t('settings.notifications.price', 'Price Alerts')}
                </label>
                <button
                  id="price-notifications"
                  type="button"
                  aria-label="Price Alerts"
                  onClick={() => handleNotificationChange('price')}
                  className={`${
                    settings.notifications.price ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.notifications.price ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Display Settings Section */}
          <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-4">{t('settings.display.title', 'Display')}</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                  {t('settings.display.theme', 'Theme')}
                </label>
                <select
                  id="theme"
                  value={settings.display.theme}
                  onChange={(e) => handleDisplayChange('theme', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="light">{t('settings.display.themeOptions.light', 'Light')}</option>
                  <option value="dark">{t('settings.display.themeOptions.dark', 'Dark')}</option>
                  <option value="system">{t('settings.display.themeOptions.system', 'System')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  {t('settings.display.currency', 'Display Currency')}
                </label>
                <select
                  id="currency"
                  value={settings.display.currency}
                  onChange={(e) => handleDisplayChange('currency', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="CHZ">CHZ</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('settings.saveChanges', 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
}
