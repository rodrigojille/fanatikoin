import React from 'react';
import { formatUnits } from 'ethers';
import { useTranslation } from 'next-i18next';

interface TokenStatsProps {
  token: {
    name: string;
    symbol: string;
    totalSupply: bigint;
    circulatingSupply: bigint;
    holders: number;
    price: string;
  };
  onBuyback: () => void;
  onCreateAuction: () => void;
}

export const TokenStats: React.FC<TokenStatsProps> = ({ token, onBuyback, onCreateAuction }) => {
  const { t } = useTranslation('common');
  const availableSupply = token.totalSupply - token.circulatingSupply;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{token.name}</h3>
        <span className="text-sm text-gray-500">{token.symbol}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">{t('team.totalSupply', 'Total Supply')}</p>
          <p className="text-lg font-semibold">{formatUnits(token.totalSupply, 18)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{t('team.circulatingSupply', 'In Circulation')}</p>
          <p className="text-lg font-semibold">{formatUnits(token.circulatingSupply, 18)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{t('team.availableSupply', 'Available')}</p>
          <p className="text-lg font-semibold">{formatUnits(availableSupply, 18)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{t('team.holders', 'Holders')}</p>
          <p className="text-lg font-semibold">{token.holders}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">{t('team.currentPrice', 'Current Price')}</p>
          <p className="text-lg font-bold text-indigo-600">{token.price} CHZ</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onBuyback}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            {t('team.buyback', 'Buyback')}
          </button>
          <button
            onClick={onCreateAuction}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            {t('team.createAuction', 'Create Auction')}
          </button>
        </div>
      </div>
    </div>
  );
};
