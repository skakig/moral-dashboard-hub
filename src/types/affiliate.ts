
export interface AffiliateProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  status: string;
  commission_rate: number;
  referral_code: string;
  earnings_total: number;
  earnings_paid: number;
  earnings_pending: number;
  approved_at: string | null;
  preferred_payout_method: string;
  payout_details: any;
  created_at: string;
  updated_at: string;
  social_profiles: any;
  tier: string;
}

export interface Referral {
  id: string;
  affiliate_id: string;
  referred_user_id: string | null;
  referral_code: string;
  status: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer_url: string | null;
  created_at: string;
  converted_at: string | null;
  expires_at: string;
  converted_plan_id: string | null;
  commission_earned: number;
}

export interface Commission {
  id: string;
  affiliate_id: string;
  referral_id: string | null;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  transaction_id: string | null;
  commission_type: string;
}

export interface PayoutRequest {
  id: string;
  affiliate_id: string;
  amount: number;
  status: string;
  payout_method: string;
  payout_details: any;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  transaction_id: string | null;
  notes: string | null;
}

export interface PromoCode {
  id: string;
  affiliate_id: string;
  code: string;
  discount_percent: number | null;
  discount_fixed: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  valid_from: string;
  valid_until: string | null;
  usage_limit: number | null;
  usage_count: number;
}

export interface AffiliateTier {
  id: string;
  name: string;
  description: string | null;
  commission_rate: number;
  min_earnings: number;
  min_referrals: number;
  benefits: any;
  created_at: string;
  updated_at: string;
}

export interface MarketingMaterial {
  id: string;
  title: string;
  description: string | null;
  material_type: string;
  asset_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AffiliateAchievement {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  criteria: any;
  reward_type: string | null;
  reward_amount: number | null;
  reward_duration: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EarnedAchievement {
  id: string;
  affiliate_id: string;
  achievement_id: string;
  earned_at: string;
  reward_applied: boolean;
  reward_expires_at: string | null;
  achievement: AffiliateAchievement;
}

export interface AffiliateLeaderboardItem {
  id: string;
  name: string;
  tier: string;
  total_earnings: number;
  total_conversions: number;
  achievements_count: number;
  rank: number;
}
