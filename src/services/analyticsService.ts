
import { supabase } from "@/integrations/supabase/client";

// Get distribution of moral levels
export async function getMoralLevelDistribution() {
  const { data, error } = await supabase
    .rpc('get_moral_level_distribution');

  if (error) {
    throw new Error(`Failed to fetch moral level distribution: ${error.message}`);
  }

  return data;
}

// Get distribution of demographics by country
export async function getCountryMoralDistribution() {
  const { data, error } = await supabase
    .rpc('get_country_moral_distribution');

  if (error) {
    throw new Error(`Failed to fetch country moral distribution: ${error.message}`);
  }

  return data;
}

// Get distribution of age ranges
export async function getAgeRangeDistribution() {
  const { data, error } = await supabase
    .rpc('get_age_range_distribution');

  if (error) {
    throw new Error(`Failed to fetch age range distribution: ${error.message}`);
  }

  return data;
}

// Get gender distribution by moral level
export async function getGenderMoralDistribution() {
  const { data, error } = await supabase
    .rpc('get_gender_moral_distribution');

  if (error) {
    throw new Error(`Failed to fetch gender moral distribution: ${error.message}`);
  }

  return data;
}

// Get overall analytics summary
export async function getAnalyticsSummary() {
  const { data, error } = await supabase
    .from('admin_analytics_summary')
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to fetch analytics summary: ${error.message}`);
  }

  return data;
}

// Update user engagement data
export async function updateUserEngagement(userId: string, engagementData: {
  total_assessments_taken?: number;
  preferred_assessment_category?: string;
  influencer_status?: boolean;
  platform_engagement_score?: number;
  shared_content?: any[];
  ai_content_interaction?: any[];
}) {
  const { error } = await supabase
    .from('user_engagement')
    .upsert([{
      user_id: userId,
      ...engagementData
    }], { onConflict: 'user_id' });

  if (error) {
    throw new Error(`Failed to update user engagement: ${error.message}`);
  }

  return true;
}

// Track content view for a user
export async function trackContentView(userId: string, contentId: string, contentType: string) {
  // Get current content views
  const { data, error } = await supabase
    .from('user_advertising_data')
    .select('most_viewed_tmh_content')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') { // Not found error is ok
    throw new Error(`Failed to fetch content view data: ${error.message}`);
  }

  // Fix: Ensure we have an array to work with
  const currentViews = Array.isArray(data?.most_viewed_tmh_content) ? 
    data.most_viewed_tmh_content : [];
  
  // Add new view with timestamp
  const updatedViews = [
    ...currentViews,
    {
      content_id: contentId,
      content_type: contentType,
      viewed_at: new Date().toISOString()
    }
  ];

  // Only keep the last 100 views to avoid gigantic arrays
  const trimmedViews = updatedViews.slice(-100);

  // Update or insert user_advertising_data
  const { error: updateError } = await supabase
    .from('user_advertising_data')
    .upsert([{
      user_id: userId,
      most_viewed_tmh_content: trimmedViews
    }], { onConflict: 'user_id' });

  if (updateError) {
    throw new Error(`Failed to update content view data: ${updateError.message}`);
  }

  return true;
}
