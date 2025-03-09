
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  AffiliateProfile, 
  Referral, 
  Commission, 
  PayoutRequest, 
  PromoCode, 
  AffiliateTier,
  MarketingMaterial,
  AffiliateAchievement
} from "@/types/affiliate";
import { toast } from "sonner";

export function useAffiliateSystem() {
  const queryClient = useQueryClient();

  // Get affiliate profile by user ID
  const useAffiliateProfile = (userId?: string) => {
    return useQuery({
      queryKey: ['affiliateProfile', userId],
      queryFn: async () => {
        if (!userId) throw new Error("User ID is required");
        
        const { data, error } = await supabase
          .from('affiliate_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // No profile found
            return null;
          }
          throw error;
        }
        
        return data as AffiliateProfile;
      },
      enabled: !!userId,
    });
  };

  // Create or update affiliate profile
  const useUpdateAffiliateProfile = () => {
    return useMutation({
      mutationFn: async ({ 
        id, 
        data 
      }: { 
        id?: string, 
        data: Partial<AffiliateProfile> & { name: string; email: string } 
      }) => {
        if (id) {
          // Update existing profile
          const { data: updatedData, error } = await supabase
            .from('affiliate_profiles')
            .update(data)
            .eq('id', id)
            .select()
            .single();
            
          if (error) throw error;
          return updatedData;
        } else {
          // Create new profile
          const { data: newData, error } = await supabase
            .from('affiliate_profiles')
            .insert(data)
            .select()
            .single();
            
          if (error) throw error;
          return newData;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['affiliateProfile'] });
        toast.success("Affiliate profile updated successfully");
      },
      onError: (error) => {
        toast.error("Failed to update affiliate profile");
        console.error("Error updating affiliate profile:", error);
      }
    });
  };

  // Get referrals for affiliate
  const useReferrals = (affiliateId?: string) => {
    return useQuery({
      queryKey: ['referrals', affiliateId],
      queryFn: async () => {
        if (!affiliateId) throw new Error("Affiliate ID is required");
        
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

  // Get commissions for affiliate
  const useCommissions = (affiliateId?: string) => {
    return useQuery({
      queryKey: ['commissions', affiliateId],
      queryFn: async () => {
        if (!affiliateId) throw new Error("Affiliate ID is required");
        
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

  // Get payout requests
  const usePayoutRequests = (affiliateId?: string) => {
    return useQuery({
      queryKey: ['payoutRequests', affiliateId],
      queryFn: async () => {
        if (!affiliateId) throw new Error("Affiliate ID is required");
        
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

  // Create payout request
  const useCreatePayoutRequest = () => {
    return useMutation({
      mutationFn: async ({
        affiliateId,
        amount,
        payoutMethod,
        payoutDetails,
      }: {
        affiliateId: string,
        amount: number,
        payoutMethod: string,
        payoutDetails: any,
      }) => {
        const { data, error } = await supabase
          .from('payout_requests')
          .insert({
            affiliate_id: affiliateId,
            amount: amount,
            payout_method: payoutMethod,
            payout_details: payoutDetails,
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['payoutRequests'] });
        toast.success("Payout request submitted successfully");
      },
      onError: (error) => {
        toast.error("Failed to submit payout request");
        console.error("Error submitting payout request:", error);
      }
    });
  };

  // Get promo codes
  const usePromoCodes = (affiliateId?: string) => {
    return useQuery({
      queryKey: ['promoCodes', affiliateId],
      queryFn: async () => {
        if (!affiliateId) throw new Error("Affiliate ID is required");
        
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

  // Create promo code
  const useCreatePromoCode = () => {
    return useMutation({
      mutationFn: async ({
        affiliateId,
        code,
        discountPercent,
        discountFixed,
        validUntil,
        usageLimit,
      }: {
        affiliateId: string,
        code: string,
        discountPercent?: number,
        discountFixed?: number,
        validUntil?: string,
        usageLimit?: number,
      }) => {
        const { data, error } = await supabase
          .from('promo_codes')
          .insert({
            affiliate_id: affiliateId,
            code: code,
            discount_percent: discountPercent,
            discount_fixed: discountFixed,
            valid_until: validUntil,
            usage_limit: usageLimit,
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
        toast.success("Promo code created successfully");
      },
      onError: (error) => {
        toast.error("Failed to create promo code");
        console.error("Error creating promo code:", error);
      }
    });
  };

  // Get affiliate tiers
  const useAffiliateTiers = () => {
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

  // Get marketing materials
  const useMarketingMaterials = () => {
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

  // Get affiliate achievements
  const useAffiliateAchievements = () => {
    return useQuery({
      queryKey: ['affiliateAchievements'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('affiliate_achievements')
          .select('*')
          .eq('is_active', true);
          
        if (error) throw error;
        return data as AffiliateAchievement[];
      },
    });
  };

  // Get earned achievements for an affiliate
  const useEarnedAchievements = (affiliateId?: string) => {
    return useQuery({
      queryKey: ['earnedAchievements', affiliateId],
      queryFn: async () => {
        if (!affiliateId) throw new Error("Affiliate ID is required");
        
        const { data, error } = await supabase
          .from('affiliate_earned_achievements')
          .select(`
            *,
            achievement:achievement_id (*)
          `)
          .eq('affiliate_id', affiliateId);
          
        if (error) throw error;
        return data;
      },
      enabled: !!affiliateId,
    });
  };

  // Get leaderboard
  const useAffiliateLeaderboard = () => {
    return useQuery({
      queryKey: ['affiliateLeaderboard'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('affiliate_leaderboard')
          .select('*')
          .limit(10);
          
        if (error) throw error;
        return data;
      },
    });
  };

  return {
    useAffiliateProfile,
    useUpdateAffiliateProfile,
    useReferrals,
    useCommissions,
    usePayoutRequests,
    useCreatePayoutRequest,
    usePromoCodes,
    useCreatePromoCode,
    useAffiliateTiers,
    useMarketingMaterials,
    useAffiliateAchievements,
    useEarnedAchievements,
    useAffiliateLeaderboard,
  };
}
