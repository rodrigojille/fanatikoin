import React from 'react';
import FanContentSubmission from '@/components/fan/FanContentSubmission';

const MOCK_LEADERBOARD = [
  { id: 1, name: 'SuperFan123', points: 1200, content: 'Excited for the big match! Go team!' },
  { id: 2, name: 'GoalieQueen', points: 950, content: 'Loved the last-minute save!' },
  { id: 3, name: 'ChilizChamp', points: 800, content: 'Collecting every NFT drop!' },
];

const FanContentPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Fan Monetization & Content Creation</h1>
      <FanContentSubmission />
      <div className="mt-8">
        <h2 className="font-bold text-xl mb-4">Top Fan Creators</h2>
        <ul className="space-y-4">
          {MOCK_LEADERBOARD.map((fan) => (
            <li key={fan.id} className="bg-gray-50 rounded-lg p-4 shadow flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <span className="font-semibold">{fan.name}</span>
                <span className="ml-2 text-blue-600 font-bold">{fan.points} pts</span>
                <p className="text-gray-700 mt-1">{fan.content}</p>
              </div>
              <span className="mt-2 md:mt-0 text-green-600 font-semibold">Top {fan.id}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FanContentPage;
