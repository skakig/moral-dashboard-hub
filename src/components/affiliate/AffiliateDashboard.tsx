
import React, { useState, useEffect } from 'react';
import { useAffiliateProfile, useReferrals, useCommissions, usePayoutRequests, usePromoCodes } from '@/hooks/useAffiliateSystem';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Copy, DollarSign, Users, LinkIcon, Award } from 'lucide-react';
import { toast } from 'sonner';
import { AffiliateStatCards } from './AffiliateStatCards';
import { ReferralsList } from './ReferralsList';
import { CommissionsList } from './CommissionsList';
import { PayoutRequestsList } from './PayoutRequestsList';
import { PromoCodesList } from './PromoCodesList';
import { MarketingMaterialsList } from './MarketingMaterialsList';
import { AchievementsList } from './AchievementsList';
import { PayoutRequestForm } from './PayoutRequestForm';
import { PromoCodeForm } from './PromoCodeForm';
import { AffiliateTierInfo } from './AffiliateTierInfo';
import { AffiliateProfileForm } from './AffiliateProfileForm';
import { AffiliateLeaderboardDisplay } from './AffiliateLeaderboardDisplay';
import { Skeleton } from '@/components/ui/skeleton';

export const AffiliateDashboard = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [showPromoCodeForm, setShowPromoCodeForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  
  // Get the current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    fetchUser();
  }, []);
  
  // Fetch affiliate data
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useAffiliateProfile(userId || undefined);
  const { data: referrals = [], isLoading: isReferralsLoading } = useReferrals(profile?.id);
  const { data: commissions = [], isLoading: isCommissionsLoading } = useCommissions(profile?.id);
  const { data: payoutRequests = [], isLoading: isPayoutRequestsLoading } = usePayoutRequests(profile?.id);
  const { data: promoCodes = [], isLoading: isPromoCodesLoading } = usePromoCodes(profile?.id);
  
  // Calculate total stats
  const totalEarnings = profile?.earnings_total || 0;
  const pendingEarnings = profile?.earnings_pending || 0;
  const paidEarnings = profile?.earnings_paid || 0;
  const totalReferrals = referrals.length;
  const successfulReferrals = referrals.filter(ref => ref.status === 'converted').length;
  
  // Handle copying referral link
  const handleCopyReferralLink = () => {
    if (profile?.referral_code) {
      const referralLink = `${window.location.origin}?ref=${profile.referral_code}`;
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard');
    }
  };
  
  // If the user is not an affiliate yet, show a sign-up form
  if (!isProfileLoading && !profile && !profileError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Become an Affiliate</CardTitle>
            <CardDescription>
              Join our affiliate program and earn commissions by referring users to our platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AffiliateProfileForm userId={userId} onSuccess={() => {
              toast.success('Affiliate application submitted successfully');
            }} />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If the profile is pending approval
  if (profile?.status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Pending</CardTitle>
            <CardDescription>
              Your affiliate application is currently under review. We'll notify you once it's approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6">
              <p className="text-muted-foreground">Please check back later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If the profile is rejected
  if (profile?.status === 'rejected') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Application Rejected</CardTitle>
            <CardDescription>
              Unfortunately, your affiliate application was not approved at this time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You can reach out to our support team for more information or to appeal this decision.</p>
            <Button>Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If the profile is suspended
  if (profile?.status === 'suspended') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Account Suspended</CardTitle>
            <CardDescription>
              Your affiliate account has been suspended. Please contact support for more information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Main dashboard for approved affiliates
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">
            Track your referrals, commissions, and manage your affiliate account.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleCopyReferralLink} className="flex items-center gap-2">
            <Copy size={16} />
            Copy Referral Link
          </Button>
          <Button variant="outline" onClick={() => setShowProfileForm(true)}>
            Edit Profile
          </Button>
        </div>
      </div>
      
      <AffiliateStatCards 
        totalEarnings={totalEarnings}
        pendingEarnings={pendingEarnings}
        paidEarnings={paidEarnings}
        totalReferrals={totalReferrals}
        successfulReferrals={successfulReferrals}
        tier={profile?.tier || 'Standard'}
        commissionRate={profile?.commission_rate || 10}
      />
      
      <AffiliateTierInfo currentTier={profile?.tier || 'Standard'} />
      
      <Tabs defaultValue="referrals" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-4">
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Your Referrals</span>
                <div className="text-sm font-normal bg-primary/10 text-primary py-1 px-3 rounded-full">
                  Your Code: {profile?.referral_code}
                </div>
              </CardTitle>
              <CardDescription>
                Track all users who signed up using your referral link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isReferralsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <ReferralsList referrals={referrals} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Your Commissions</CardTitle>
              <CardDescription>
                Track all commissions earned from your referrals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCommissionsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <CommissionsList commissions={commissions} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payout Requests</CardTitle>
                  <CardDescription>
                    Request and track your affiliate payouts.
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowPayoutForm(true)}
                  disabled={pendingEarnings < 50} // Minimum threshold
                >
                  Request Payout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showPayoutForm && (
                <div className="mb-6">
                  <PayoutRequestForm 
                    affiliateId={profile?.id || ''} 
                    maxAmount={pendingEarnings}
                    onSuccess={() => setShowPayoutForm(false)}
                    onCancel={() => setShowPayoutForm(false)} 
                  />
                </div>
              )}
              
              {isPayoutRequestsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <PayoutRequestsList payoutRequests={payoutRequests} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="promo-codes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Promo Codes</CardTitle>
                  <CardDescription>
                    Create and manage promo codes for your referrals.
                  </CardDescription>
                </div>
                <Button onClick={() => setShowPromoCodeForm(true)}>
                  Create Promo Code
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showPromoCodeForm && (
                <div className="mb-6">
                  <PromoCodeForm 
                    affiliateId={profile?.id || ''} 
                    onSuccess={() => setShowPromoCodeForm(false)} 
                    onCancel={() => setShowPromoCodeForm(false)} 
                  />
                </div>
              )}
              
              {isPromoCodesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <PromoCodesList promoCodes={promoCodes} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="marketing">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Materials</CardTitle>
              <CardDescription>
                Access graphics, email templates, and other materials to help promote our platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarketingMaterialsList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Badges</CardTitle>
              <CardDescription>
                Track your achievements and earn bonuses for reaching milestones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AchievementsList affiliateId={profile?.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Leaderboard</CardTitle>
          <CardDescription>
            See how you rank against other affiliates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AffiliateLeaderboardDisplay affiliateId={profile?.id} />
        </CardContent>
      </Card>
      
      {showProfileForm && (
        <AffiliateProfileForm 
          userId={userId} 
          profile={profile} 
          onSuccess={() => setShowProfileForm(false)} 
          onCancel={() => setShowProfileForm(false)} 
        />
      )}
    </div>
  );
};
