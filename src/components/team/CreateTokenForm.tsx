import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';

interface CreateTokenFormProps {
  onSubmit: (name: string, symbol: string, totalSupply: number, initialPrice: number) => Promise<void>;
  isLoading: boolean;
}

export const CreateTokenForm: React.FC<CreateTokenFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useTranslation('common');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [initialPrice, setInitialPrice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && symbol && totalSupply && initialPrice) {
      await onSubmit(
        name,
        symbol,
        parseFloat(totalSupply),
        parseFloat(initialPrice)
      );
      // Reset form
      setName('');
      setSymbol('');
      setTotalSupply('');
      setInitialPrice('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">{t('team.createToken', 'Create New Token')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('team.tokenName', 'Token Name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Barcelona Fan Token"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('team.tokenSymbol', 'Token Symbol')}
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., BAR"
            maxLength={5}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('team.totalSupply', 'Total Supply')}
          </label>
          <input
            type="number"
            value={totalSupply}
            onChange={(e) => setTotalSupply(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="1000000"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('team.initialPrice', 'Initial Price (CHZ)')}
          </label>
          <input
            type="number"
            value={initialPrice}
            onChange={(e) => setInitialPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="1.0"
            min="0.000001"
            step="0.000001"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? t('team.creating', 'Creating...') : t('team.create', 'Create Token')}
        </button>
      </form>
    </div>
  );
};
