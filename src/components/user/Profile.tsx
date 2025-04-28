import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatEther } from '@ethersproject/units';
import { useTranslation } from 'next-i18next';

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function Profile() {
  const { t } = useTranslation('common');
  const { user, balance, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Determine user role for display
  let roleLabel = t('profile.role.fan', 'Fan');
  let roleDesc = t('profile.role.fanDesc', 'You are a fan. Participate in challenges and earn rewards!');
  if (user?.isAdmin) {
    roleLabel = t('profile.role.admin', 'Admin');
    roleDesc = t('profile.role.adminDesc', 'You are an admin. You can manage the platform and oversee all activities.');
  } else if (user?.isTeam) {
    roleLabel = t('profile.role.team', 'Team');
    roleDesc = t('profile.role.teamDesc', 'You are a team representative. Manage your team tokens and engage with fans.');
  }

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.walletAddress) return;

    await updateProfile(user?._id || '', { ...formData });
    setIsEditing(false);
  };

  if (!user?.walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-xl text-gray-600">{t('profile.connectWalletMessage', 'Please connect your wallet to view your profile')}</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">{t('profile.edit', 'Edit Profile')}</h2>
        {/* Role display in edit mode */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold mr-2">
            {t('profile.role', 'Role')}: {roleLabel}
          </span>
          <span className="text-sm text-gray-500">{roleDesc}</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">{t('profile.username', 'Username')}</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('profile.email', 'Email')}</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('profile.saveChanges', 'Save Changes')}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {user?.username || t('profile.anonymous', 'Anonymous')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('profile.title', 'User Profile')}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{t('profile.subtitle', 'Personal details and wallet information')}</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{t('profile.walletAddress', 'Wallet Address')}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.walletAddress ? formatAddress(user.walletAddress) : '-'}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{t('profile.chzBalance', 'CHZ Balance')}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {balance && balance !== '0.0' ? `${Number(formatEther(balance))} CHZ` : '0 CHZ'}
              </dd>
            </div>
            {user && (
              <>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">{t('profile.role', 'Role')}</dt>
                  <dd className="mt-1 text-sm text-blue-700 font-semibold sm:mt-0 sm:col-span-2">
                    {roleLabel}
                    <span className="ml-2 text-xs text-gray-500">{roleDesc}</span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">{t('profile.username', 'Username')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.username}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">{t('profile.email', 'Email')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">{t('profile.avatar', 'Avatar')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <img src="/default-avatar.png" alt="Profile" className="w-32 h-32 rounded-full" />
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('profile.edit', 'Edit Profile')}
          </button>
        </div>
      </div>
    </div>
  );
}
