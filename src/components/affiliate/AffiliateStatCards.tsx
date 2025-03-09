
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Clock, Award, Percent } from 'lucide-react';

interface AffiliateStatCardsProps {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  totalReferrals: number;
  successfulReferrals: number;
  tier: string;
  commissionRate: number;
}

export const AffiliateStatCards = ({
  totalEarnings,
  pendingEarnings,
  paidEarnings,
  totalReferrals,
  successfulReferrals,
  tier,
  commissionRate
}: AffiliateStatCardsProps) => {
  const conversionRate = totalReferrals > 0 
    ? ((successfulReferrals / totalReferrals) * 100).toFixed(1) 
    : '0.0';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
              <h3 className="text-2xl font-bold">${totalEarnings.toFixed(2)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-orange-500/10 rounded-full">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Earnings</p>
              <h3 className="text-2xl font-bold">${pendingEarnings.toFixed(2)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-500/10 rounded-full">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paid Earnings</p>
              <h3 className="text-2xl font-bold">${paidEarnings.toFixed(2)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
              <h3 className="text-2xl font-bold">{totalReferrals}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-500/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <h3 className="text-2xl font-bold">{conversionRate}%</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-yellow-500/10 rounded-full">
              <Award className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Tier</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{tier}</h3>
                <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Percent className="h-3 w-3" /> 
                  {commissionRate}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
