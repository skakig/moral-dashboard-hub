
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  AffiliateProfile, 
  Referral, 
  Commission, 
  PayoutRequest, 
  PromoCode, 
  MarketingMaterial,
  AffiliateAchievement,
  AffiliateEarnedAchievement,
  AffiliateTier,
  AffiliateLeaderboardEntry,
  MonthlyTopPerformer
} from '@/types/affiliate';
import { toast } from 'sonner';

// Affiliate Profile
export const useAffiliateProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['affiliateProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data as AffiliateProfile;
    },
    enabled: !!userId,
  });
};

export const useCreateAffiliateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Partial<AffiliateProfile>) => {
      // Generate a random referral code if not provided
      if (!profile.referral_code) {
        const { data: codeData } = await supabase.rpc('generate_referral_code');
        profile.referral_code = codeData;
      }
      
      const { data, error } = await supabase
        .from('affiliate_profiles')
        .insert(profile)
        .select()
        .single();
      
      if (error) throw error;
      return data as AffiliateProfile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['affiliateProfile'] });
      toast.success('Affiliate profile created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create affiliate profile: ${error.message}`);
    }
  });
};

export const useUpdateAffiliateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...profile }: Partial<AffiliateProfile> & { id: string }) => {
      const { data, error } = await supabase
        .from('affiliate_profiles')
        .update(profile)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as AffiliateProfile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['affiliateProfile'] });
      toast.success('Affiliate profile updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update affiliate profile: ${error.message}`);
    }
  });
};

// Referrals
export const useReferrals = (affiliateId?: string) => {
  return useQuery({
    queryKey: ['referrals', affiliateId],
    queryFn: async () => {
      if (!affiliateId) return [];
      
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Referral[];
    },
    enabled: !!affiliateId,
  });
};

// Commissions
export const useCommissions = (affiliateId?: string) => {
  return useQuery({
    queryKey: ['commissions', affiliateId],
    queryFn: async () => {
      if (!affiliateId) return [];
      
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Commission[];
    },
    enabled: !!affiliateId,
  });
};

// Payout Requests
export const usePayoutRequests = (affiliateId?: string) => {
  return useQuery({
    queryKey: ['payoutRequests', affiliateId],
    queryFn: async () => {
      if (!affiliateId) return [];
      
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PayoutRequest[];
    },
    enabled: !!affiliateId,
  });
};

export const useCreatePayoutRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: Partial<PayoutRequest>) => {
      const { data, error } = await supabase
        .from('payout_requests')
        .insert(request)
        .select()
        .single();
      
      if (error) throw error;
      return data as PayoutRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payoutRequests'] });
      toast.success('Payout request submitted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to submit payout request: ${error.message}`);
    }
  });
};

// Promo Codes
export const usePromoCodes = (affiliateId?: string) => {
  return useQuery({
    queryKey: ['promoCodes', affiliateId],
    queryFn: async () => {
      if (!affiliateId) return [];
      
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PromoCode[];
    },
    enabled: !!affiliateId,
  });
};

export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (promoCode: Partial<PromoCode>) => {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert(promoCode)
        .select()
        .single();
      
      if (error) throw error;
      return data as PromoCode;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      toast.success('Promo code created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create promo code: ${error.message}`);
    }
  });
};

// Marketing Materials
export const useMarketingMaterials = () => {
  return useQuery({
    queryKey: ['marketingMaterials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_materials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MarketingMaterial[];
    },
  });
};

// Achievements
export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_achievements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AffiliateAchievement[];
    },
  });
};

export const useEarnedAchievements = (affiliateId?: string) => {
  return useQuery({
    queryKey: ['earnedAchievements', affiliateId],
    queryFn: async () => {
      if (!affiliateId) return [];
      
      const { data, error } = await supabase
        .from('affiliate_earned_achievements')
        .select(`
          *,
          affiliate_achievements:achievement_id (*)
        `)
        .eq('affiliate_id', affiliateId)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!affiliateId,
  });
};

// Tiers
export const useAffiliateTiers = () => {
  return useQuery({
    queryKey: ['affiliateTiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_tiers')
        .select('*')
        .order('min_earnings', { ascending: true });
      
      if (error) throw error;
      return data as AffiliateTier[];
    },
  });
};

// Leaderboard
export const useAffiliateLeaderboard = (limit = 10) => {
  return useQuery({
    queryKey: ['affiliateLeaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_leaderboard')
        .select('*')
        .limit(limit);
      
      if (error) throw error;
      return data as AffiliateLeaderboardEntry[];
    },
  });
};

// Monthly Top Performers
export const useMonthlyTopPerformers = () => {
  return useQuery({
    queryKey: ['monthlyTopPerformers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_top_performers')
        .select('*');
      
      if (error) throw error;
      return data as MonthlyTopPerformer[];
    },
  });
};

// Referral Tracking
export const useTrackReferral = () => {
  return useMutation({
    mutationFn: async (referralCode: string) => {
      // Get affiliate information from the referral code
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliate_profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (affiliateError) throw affiliateError;
      
      const referrer = document.referrer || '';
      const userAgent = navigator.userAgent;
      
      // Create a new referral record
      const { data, error } = await supabase
        .from('referrals')
        .insert({
          affiliate_id: affiliateData.id,
          referral_code: referralCode,
          ip_address: '127.0.0.1', // In a real app, this would be captured server-side
          user_agent: userAgent,
          referrer_url: referrer,
          status: 'pending',
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Store the referral ID in localStorage to track this later
      localStorage.setItem('tmh_referral_id', data.id);
      localStorage.setItem('tmh_referral_code', referralCode);
      
      return data;
    }
  });
};

// Cookie-based Tracking Helper
export const checkForReferralCode = () => {
  // Check URL for referral code
  const params = new URLSearchParams(window.location.search);
  const referralCode = params.get('ref');
  
  if (referralCode) {
    // If referral code found, store in localStorage
    localStorage.setItem('tmh_referral_code', referralCode);
    
    // Optional: Use the mutation to track this referral
    const { mutate } = useTrackReferral();
    mutate(referralCode);
  }
  
  // Return the stored referral code, if any
  return localStorage.getItem('tmh_referral_code');
};
