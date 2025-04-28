import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { ethers } from 'ethers';
import { metamaskService } from '@/services/metamask';
import useTokenStaking from '@/hooks/useTokenStaking';
import { CONTRACT_ADDRESSES } from '@/contracts/config';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { UserToken } from '@/types/token';

interface FanEngagementProps {
  token: UserToken;
  onUpdate: () => void;
}

/**
 * Fan Engagement component for staking page
 * Enhances fan-team interaction with rewards, challenges, and community features
 */
const FanEngagement: React.FC<FanEngagementProps> = ({ token, onUpdate }) => {
  const { t } = useTranslation('common');
  const { 
    stakingInfo, 
    userStakeInfo, 
    claimableRewards, 
    refreshStakingInfo,
    stake,
    unstake,
    claimRewards,
    loading,
    error
  } = useTokenStaking();
  
  const [engagementPoints, setEngagementPoints] = useState<number>(0);
  const [fanLevel, setFanLevel] = useState<string>('Bronze');
  const [challengesCompleted, setChallengesCompleted] = useState<number>(0);
  const [showChallenges, setShowChallenges] = useState<boolean>(false);
  const [showRewards, setShowRewards] = useState<boolean>(false);
  
  // Challenges for fan engagement
  const challenges = [
    { id: 1, name: t('fanEngagement.challenge.stake7days.name'), description: t('fanEngagement.challenge.stake7days.description'), points: 50, completed: false },
    { id: 2, name: t('fanEngagement.challenge.referFriend.name'), description: t('fanEngagement.challenge.referFriend.description'), points: 100, completed: false },
    { id: 3, name: t('fanEngagement.challenge.socialShare.name'), description: t('fanEngagement.challenge.socialShare.description'), points: 75, completed: false },
    { id: 4, name: t('fanEngagement.challenge.matchPrediction.name'), description: t('fanEngagement.challenge.matchPrediction.description'), points: 150, completed: false },
    { id: 5, name: t('fanEngagement.challenge.communityPoll.name'), description: t('fanEngagement.challenge.communityPoll.description'), points: 25, completed: true }
  ];
  
  // Fan rewards based on engagement level
  const fanRewards = [
    { level: 'Bronze', points: 0, benefits: ['Basic fan profile', 'Community access'] },
    { level: 'Silver', points: 200, benefits: ['Bronze benefits', 'Exclusive content access', 'Digital collectibles'] },
    { level: 'Gold', points: 500, benefits: ['Silver benefits', 'Match ticket discounts', 'Merchandise discounts'] },
    { level: 'Platinum', points: 1000, benefits: ['Gold benefits', 'Meet & greet opportunities', 'VIP experiences'] }
  ];
  
  // Load staking info when token changes
  useEffect(() => {
    if (token && token.address) {
      refreshStakingInfo(token.address);
      
      // Simulate loading engagement data from API
      setTimeout(() => {
        // This would be replaced with actual API call in production
        const mockEngagementPoints = Math.floor(Math.random() * 800) + 100;
        setEngagementPoints(mockEngagementPoints);
        
        // Set fan level based on points
        if (mockEngagementPoints >= 1000) {
          setFanLevel('Platinum');
        } else if (mockEngagementPoints >= 500) {
          setFanLevel('Gold');
        } else if (mockEngagementPoints >= 200) {
          setFanLevel('Silver');
        } else {
          setFanLevel('Bronze');
        }
        
        // Set random challenges completed
        setChallengesCompleted(Math.floor(Math.random() * 3) + 1);
      }, 1000);
    }
  }, [token, refreshStakingInfo]);
  
  // Calculate progress to next level
  const getNextLevel = () => {
    if (fanLevel === 'Platinum') return null;
    
    const currentLevelIndex = fanRewards.findIndex(r => r.level === fanLevel);
    return fanRewards[currentLevelIndex + 1];
  };
  
  const nextLevel = getNextLevel();
  const progressToNextLevel = nextLevel 
    ? Math.min(100, ((engagementPoints - fanRewards.find(r => r.level === fanLevel)!.points) / 
       (nextLevel.points - fanRewards.find(r => r.level === fanLevel)!.points)) * 100)
    : 100;
  
  // Handle completing a challenge
  const completeChallenge = (challengeId: number) => {
    // This would be replaced with actual API call in production
    const pointsEarned = challenges.find(c => c.id === challengeId)?.points || 0;
    setEngagementPoints(prev => prev + pointsEarned);
    
    // Update challenges completed
    setChallengesCompleted(prev => prev + 1);
    
    // Show success message
    alert(`Challenge completed! You earned ${pointsEarned} points.`);
    
    // Update parent component
    onUpdate();
  };
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{t('fanEngagement.title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fan Level Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{t('fanEngagement.fanLevel')}</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
              {fanLevel} {t('fanEngagement.fan')}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span>{engagementPoints} {t('fanEngagement.points')}</span>
              {nextLevel && (
                <span>{nextLevel.points} {t('fanEngagement.pointsForNextLevel')}</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progressToNextLevel}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">{t('fanEngagement.currentBenefits')}</h4>
            <ul className="list-disc pl-5">
              {fanRewards.find(r => r.level === fanLevel)?.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-gray-700">{benefit}</li>
              ))}
            </ul>
          </div>
          
          <Button 
            onClick={() => setShowRewards(!showRewards)}
            variant="secondary"
            className="w-full"
          >
            {showRewards ? t('common.hide') : t('fanEngagement.viewAllRewards')}
          </Button>
          
          {showRewards && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">{t('fanEngagement.allRewards')}</h4>
              <div className="space-y-3">
                {fanRewards.map((reward, index) => (
                  <div key={index} className={`p-3 rounded-lg ${reward.level === fanLevel ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                    <div className="flex justify-between">
                      <span className="font-semibold">{reward.level}</span>
                      <span>{reward.points} {t('fanEngagement.points')}</span>
                    </div>
                    <ul className="list-disc pl-5 mt-1">
                      {reward.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm text-gray-700">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        
        {/* Challenges Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{t('fanEngagement.challenges')}</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
              {challengesCompleted}/{challenges.length} {t('fanEngagement.completed')}
            </span>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700">
              {t('fanEngagement.challengesDescription')}
            </p>
          </div>
          
          <Button 
            onClick={() => setShowChallenges(!showChallenges)}
            variant="secondary"
            className="w-full"
          >
            {showChallenges ? t('common.hide') : t('fanEngagement.viewChallenges')}
          </Button>
          
          {showChallenges && (
            <div className="mt-4 space-y-3">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-semibold">{challenge.name}</span>
                    <span className="text-sm text-blue-600">+{challenge.points} {t('fanEngagement.points')}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{challenge.description}</p>
                  <div className="mt-2">
                    {challenge.completed ? (
                      <span className="text-sm text-green-600 font-semibold">✓ {t('fanEngagement.completed')}</span>
                    ) : (
                      <Button 
                        onClick={() => completeChallenge(challenge.id)}
                        variant="primary"
                        size="sm"
                      >
                        {t('fanEngagement.complete')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      
      {/* Community Activity */}
      <Card className="p-6 mt-6">
        <h3 className="text-xl font-bold mb-4">{t('fanEngagement.communityActivity')}</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">{t('fanEngagement.upcomingEvents')}</h4>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>{t('fanEngagement.events.ama')}</span>
              <span className="text-sm text-gray-600">{t('fanEngagement.events.amaTime', 'Tomorrow, 18:00 UTC')}</span>
            </li>
            <li className="flex justify-between">
              <span>{t('fanEngagement.events.watchParty')}</span>
              <span className="text-sm text-gray-600">{t('fanEngagement.events.watchPartyTime', 'Saturday, 15:30 UTC')}</span>
            </li>
            <li className="flex justify-between">
              <span>{t('fanEngagement.events.exclusiveMeeting')}</span>
              <span className="text-sm text-gray-600">{t('fanEngagement.events.exclusiveMeetingTime', 'Next Tuesday, 19:00 UTC')}</span>
            </li>
          </ul>
        </div> 
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">{t('fanEngagement.communityPolls')}</h4>
          <div className="space-y-4">
            <div>
              <p className="mb-2">{t('fanEngagement.polls.featuredPlayer')}</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="radio" id="player1" name="featured-player" className="mr-2" />
                  <label htmlFor="player1">{t('fanEngagement.polls.player1')}</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="player2" name="featured-player" className="mr-2" />
                  <label htmlFor="player2">{t('fanEngagement.polls.player2')}</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="player3" name="featured-player" className="mr-2" />
                  <label htmlFor="player3">{t('fanEngagement.polls.player3')}</label>
                </div>
              </div>
              <Button className="mt-2" size="sm">
                {t('common.submit')}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FanEngagement;
