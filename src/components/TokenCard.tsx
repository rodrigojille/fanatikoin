import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TokenCardProps {
  id: number;
  name: string;
  symbol: string;
  price: number;
  image?: string;
  supply: number;
  available: number;
}

const TokenCard: React.FC<TokenCardProps> = ({
  id,
  name,
  symbol,
  price,
  image,
  supply,
  available
}) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-lg flex items-center justify-center">
        {image ? (
          <div className="relative w-full h-full">
            <Image 
              src={image} 
              alt={name}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div className="text-2xl font-bold text-gray-400">{name}</div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{name}</h3>
          <div className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
            {symbol}
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>Available</span>
            <span>{Math.round(available / 1000)}K / {Math.round(supply / 1000)}K</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${(available / supply) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
            <p className="text-xl font-bold">{price} CHZ</p>
          </div>
          <Link href={`/token/${id}`} className="btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;
