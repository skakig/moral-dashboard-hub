
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Check } from 'lucide-react';
import { useAchievements, useEarnedAchievements } from '@/hooks/useAffiliateSystem';
import { Skeleton } from '@/components/ui/skeleton';

interface AchievementsListProps {
  affiliateId?: string;
}

export function AchievementsList({ affiliateId }: AchievementsListProps) {
  const { data: achievements = [], isLoading: isAchievementsLoading } = useAchievements();
  const { data: earnedAchievements = [], isLoading: isEarnedLoading } = useEarnedAchievements(affiliateId);
  
  const isLoading = isAchievementsLoading || isEarnedLoading;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
      </div>
    );
  }
  
  if (achievements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No achievements available yet.</p>
        <p className="mt-2">Complete tasks and milestones to earn badges and rewards.</p>
      </div>
    );
  }
  
  // Get earned achievement IDs for easy lookup
  const earnedIds = earnedAchievements.map((earned: any) => earned.achievement_id);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((achievement) => {
        const isEarned = earnedIds.includes(achievement.id);
        const earnedDetails = isEarned 
          ? earnedAchievements.find((earned: any) => earned.achievement_id === achievement.id) 
          : null;
        
        return (
          <AchievementCard 
            key={achievement.id}
            achievement={achievement}
            isEarned={isEarned}
            earnedAt={earnedDetails?.earned_at}
            rewardApplied={earnedDetails?.reward_applied}
          />
        );
      })}
    </div>
  );
}

interface AchievementCardProps {
  achievement: any;
  isEarned: boolean;
  earnedAt?: string;
  rewardApplied?: boolean;
}

const AchievementCard = ({ 
  achievement, 
  isEarned, 
  earnedAt,
  rewardApplied 
}: AchievementCardProps) => {
  return (
    <Card className={isEarned ? 'border-2 border-yellow-500' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${isEarned ? 'bg-yellow-500/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
            {achievement.icon_url ? (
              <img 
                src={achievement.icon_url} 
                alt={achievement.name} 
                className="h-8 w-8" 
              />
            ) : (
              <Award className={`h-8 w-8 ${isEarned ? 'text-yellow-500' : 'text-gray-400'}`} />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{achievement.name}</h3>
              {isEarned && (
                <Badge variant="default">
                  <Check className="h-3 w-3 mr-1" /> Earned
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            
            {achievement.reward_type && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Reward: {achievement.reward_type === 'commission_boost' 
                    ? `+${achievement.reward_amount}% commission for ${achievement.reward_duration} days` 
                    : `$${achievement.reward_amount} bonus`}
                </Badge>
                
                {isEarned && rewardApplied && (
                  <Badge variant="outline" className="text-xs ml-2 bg-green-500/10 text-green-600 border-green-200">
                    Reward claimed
                  </Badge>
                )}
              </div>
            )}
            
            {!isEarned && achievement.criteria?.min_sales && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Progress: 0/{achievement.criteria.min_sales} sales</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-1.5" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
