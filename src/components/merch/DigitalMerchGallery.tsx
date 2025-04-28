import React from 'react';

const MOCK_MERCH = [
  {
    id: 1,
    name: '2025 Limited Edition Jersey NFT',
    image: '/mock/jersey-nft.png',
    description: 'A unique digital collectible for superfans.',
    claimed: false,
  },
  {
    id: 2,
    name: 'Signed Match Ball NFT',
    image: '/mock/ball-nft.png',
    description: 'Digitally signed by the team!',
    claimed: true,
  },
  {
    id: 3,
    name: 'VIP Pass NFT',
    image: '/mock/vip-nft.png',
    description: 'Grants access to exclusive events.',
    claimed: false,
  },
];

const DigitalMerchGallery: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {MOCK_MERCH.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <img src={item.image} alt={item.name} className="w-32 h-32 object-contain mb-4" />
          <h3 className="font-bold text-lg mb-1">{item.name}</h3>
          <p className="text-gray-600 text-sm mb-2 text-center">{item.description}</p>
          {item.claimed ? (
            <span className="text-green-600 font-semibold">Claimed</span>
          ) : (
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Claim</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DigitalMerchGallery;
