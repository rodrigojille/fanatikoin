import React from 'react';

const MOCK_PERKS = [
  {
    id: 1,
    name: 'VIP Seat Upgrade',
    description: 'Upgrade your seat to the VIP section for the next match.',
    available: true,
  },
  {
    id: 2,
    name: 'Tunnel Walk Experience',
    description: 'Join the team as they walk onto the pitch!',
    available: false,
  },
  {
    id: 3,
    name: 'Signed Jersey Pickup',
    description: 'Pick up a signed jersey at the stadium store.',
    available: true,
  },
];

const StadiumExperiencePage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Stadium Experience Enhancements</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_PERKS.map((perk) => (
          <div key={perk.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
            <h2 className="font-bold text-lg mb-2">{perk.name}</h2>
            <p className="text-gray-700 mb-4">{perk.description}</p>
            {perk.available ? (
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Redeem</button>
            ) : (
              <span className="text-gray-400 font-semibold">Not Available</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StadiumExperiencePage;
