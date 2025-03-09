
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

export function useAffiliateProfile(userId?: string) {
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
}

export function useUpdateAffiliateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id?: string, 
      data: Partial<AffiliateProfile> & { name: string; email: string; referral_code: string; } 
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
          .insert({
            ...data,
            status: 'pending',
            commission_rate: 10, // Default commission rate
            earnings_total: 0,
            earnings_paid: 0,
            earnings_pending: 0,
          })
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
}

export function useReferrals(affiliateId?: string) {
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
}

export function useCommissions(affiliateId?: string) {
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
}

export function usePayoutRequests(affiliateId?: string) {
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
}

export function useCreatePayoutRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      affiliate_id,
      amount,
      payout_method,
      payout_details,
      notes
    }: {
      affiliate_id: string,
      amount: number,
      payout_method: string,
      payout_details: any,
      notes?: string,
    }) => {
      const { data, error } = await supabase
        .from('payout_requests')
        .insert({
          affiliate_id,
          amount,
          payout_method,
          payout_details,
          notes,
          status: 'pending'
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
}

export function usePromoCodes(affiliateId?: string) {
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
}

export function useCreatePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      affiliate_id,
      code,
      discount_percent,
      discount_fixed,
      valid_until,
      usage_limit,
    }: {
      affiliate_id: string,
      code: string,
      discount_percent?: number,
      discount_fixed?: number,
      valid_until?: string,
      usage_limit?: number,
    }) => {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert({
          affiliate_id,
          code,
          discount_percent,
          discount_fixed,
          valid_until,
          usage_limit,
          is_active: true,
          usage_count: 0,
          valid_from: new Date().toISOString()
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
}

export function useAffiliateTiers() {
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
}

export function useMarketingMaterials() {
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
}

export function useAchievements() {
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
}

export function useEarnedAchievements(affiliateId?: string) {
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
}

export function useAffiliateLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: ['affiliateLeaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_leaderboard')
        .select('*')
        .limit(limit);
        
      if (error) throw error;
      return data;
    },
  });
}
