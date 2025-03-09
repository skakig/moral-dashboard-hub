
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronRight } from 'lucide-react';
import { useAffiliateTiers } from '@/hooks/useAffiliateSystem';
import { Skeleton } from '@/components/ui/skeleton';

interface AffiliateTierInfoProps {
  currentTier: string;
}

export const AffiliateTierInfo = ({ currentTier }: AffiliateTierInfoProps) => {
  const { data: tiers = [], isLoading } = useAffiliateTiers();
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  if (tiers.length === 0) {
    return null;
  }
  
  // Find current tier and next tier
  const currentTierIndex = tiers.findIndex(tier => tier.name.toLowerCase() === currentTier.toLowerCase());
  const currentTierData = tiers[currentTierIndex];
  const nextTierData = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
  
  if (!currentTierData) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Affiliate Tier</CardTitle>
        <CardDescription>
          Your current benefits and next tier goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <h3 className="text-lg font-medium mb-2">Current Tier: {currentTierData.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{currentTierData.description}</p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Your Benefits:</p>
              <ul className="space-y-1">
                {Array.isArray(currentTierData.benefits) && currentTierData.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    {benefit}
                  </li>
                ))}
                <li className="flex items-center text-sm font-semibold">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  {currentTierData.commission_rate}% Commission Rate
                </li>
              </ul>
            </div>
          </div>
          
          {nextTierData && (
            <>
              <div className="hidden lg:flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <ChevronRight className="h-10 w-10 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Next Tier</span>
                </div>
              </div>
              
              <div className="col-span-1">
                <h3 className="text-lg font-medium mb-2">Next Tier: {nextTierData.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{nextTierData.description}</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Requirements to Reach:</p>
                  <ul className="space-y-1">
                    <li className="text-sm">
                      Total Earnings: ${nextTierData.min_earnings.toFixed(2)}
                    </li>
                    <li className="text-sm">
                      Successful Referrals: {nextTierData.min_referrals}
                    </li>
                  </ul>
                  
                  <p className="text-sm font-medium mt-4">You'll Receive:</p>
                  <ul className="space-y-1">
                    <li className="text-sm font-semibold">
                      {nextTierData.commission_rate}% Commission Rate (+ {(nextTierData.commission_rate - currentTierData.commission_rate).toFixed(1)}%)
                    </li>
                    {Array.isArray(nextTierData.benefits) && nextTierData.benefits
                      .filter(benefit => !currentTierData.benefits.includes(benefit))
                      .map((benefit, index) => (
                        <li key={index} className="text-sm">
                          {benefit}
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
