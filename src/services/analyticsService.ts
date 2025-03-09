
import { supabase } from "@/integrations/supabase/client";

// Track when a user views content
export const trackContentView = async (userId: string, contentId: string, contentType: 'article' | 'assessment' | 'video') => {
  try {
    // Record the view
    // Note: Instead of using "content_views" which doesn't exist, we'll track in user_engagement
    await supabase
      .from('user_engagement')
      .upsert({
        user_id: userId,
        last_viewed_content_id: contentId,
        last_viewed_content_type: contentType,
        last_activity: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
  } catch (error) {
    console.error('Error tracking content view:', error);
  }
};

// Update user engagement score
export const updateUserEngagement = async (userId: string, actionType: string, points = 1) => {
  try {
    // Fetch current engagement score
    const { data: userData, error: fetchError } = await supabase
      .from('user_engagement')
      .select('platform_engagement_score')
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching user engagement data:', fetchError);
      // If no record exists, insert a new one
      await supabase
        .from('user_engagement')
        .insert({ 
          user_id: userId,
          platform_engagement_score: points,
          last_activity: new Date().toISOString(),
          referral_source: actionType
        });
      return;
    }
    
    const currentScore = userData?.platform_engagement_score || 0;
    
    // Update score
    await supabase
      .from('user_engagement')
      .update({ 
        platform_engagement_score: currentScore + points,
        last_activity: new Date().toISOString(),
        referral_source: actionType
      })
      .eq('user_id', userId);
      
  } catch (error) {
    console.error('Error updating user engagement:', error);
  }
};

// Mock data for demographics - to be replaced with real database calls later
export const getAgeRangeDistribution = async () => {
  try {
    // This would normally be a Supabase function call
    return [
      { age_range: "18-24", user_count: 120 },
      { age_range: "25-34", user_count: 350 },
      { age_range: "35-44", user_count: 240 },
      { age_range: "45-54", user_count: 180 },
      { age_range: "55-64", user_count: 95 },
      { age_range: "65+", user_count: 65 }
    ];
  } catch (error) {
    console.error('Error fetching age range distribution:', error);
    return [];
  }
};

// Get demographics data for gender/moral level distribution
export const getGenderMoralDistribution = async () => {
  try {
    // Mock data for now
    return [
      { gender: "Male", moral_level: 1, user_count: 50 },
      { gender: "Male", moral_level: 2, user_count: 120 },
      { gender: "Male", moral_level: 3, user_count: 180 },
      { gender: "Male", moral_level: 4, user_count: 210 },
      { gender: "Male", moral_level: 5, user_count: 150 },
      { gender: "Male", moral_level: 6, user_count: 90 },
      { gender: "Male", moral_level: 7, user_count: 45 },
      { gender: "Male", moral_level: 8, user_count: 20 },
      { gender: "Male", moral_level: 9, user_count: 5 },
      { gender: "Female", moral_level: 1, user_count: 30 },
      { gender: "Female", moral_level: 2, user_count: 110 },
      { gender: "Female", moral_level: 3, user_count: 190 },
      { gender: "Female", moral_level: 4, user_count: 230 },
      { gender: "Female", moral_level: 5, user_count: 180 },
      { gender: "Female", moral_level: 6, user_count: 110 },
      { gender: "Female", moral_level: 7, user_count: 55 },
      { gender: "Female", moral_level: 8, user_count: 25 },
      { gender: "Female", moral_level: 9, user_count: 8 }
    ];
  } catch (error) {
    console.error('Error fetching gender moral distribution:', error);
    return [];
  }
};

// Get country distribution data
export const getCountryMoralDistribution = async () => {
  try {
    // Mock data for now
    return [
      { country: "United States", avg_moral_level: 5.2, user_count: 350 },
      { country: "Canada", avg_moral_level: 5.5, user_count: 120 },
      { country: "United Kingdom", avg_moral_level: 5.3, user_count: 180 },
      { country: "Australia", avg_moral_level: 5.1, user_count: 95 },
      { country: "Germany", avg_moral_level: 5.4, user_count: 145 },
      { country: "France", avg_moral_level: 5.0, user_count: 110 },
      { country: "Japan", avg_moral_level: 5.7, user_count: 85 },
      { country: "India", avg_moral_level: 4.9, user_count: 210 },
      { country: "Brazil", avg_moral_level: 4.8, user_count: 180 }
    ];
  } catch (error) {
    console.error('Error fetching country moral distribution:', error);
    return [];
  }
};

// Get analytics summary
export const getAnalyticsSummary = async () => {
  try {
    // Mock data for now
    return {
      total_users: 2860,
      total_influencers: 85,
      average_moral_level: 5.2,
      average_engagement: 7.8,
      average_conversion_rate: 0.12
    };
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return null;
  }
};

// Function to get demographic targeting suggestions
export const getDemographicsForTargeting = async () => {
  try {
    // This would connect to an AI service or database in the future
    // For now, return mock data
    return {
      targetGroups: [
        { value: "age-18-24", label: "Age 18-24", count: 120, type: "age" },
        { value: "age-25-34", label: "Age 25-34", count: 350, type: "age" },
        { value: "age-35-44", label: "Age 35-44", count: 240, type: "age" },
        { value: "gender-male", label: "Male", count: 870, type: "gender" },
        { value: "gender-female", label: "Female", count: 938, type: "gender" },
        { value: "moral-1-3", label: "Moral Level 1-3", count: 680, type: "moral" },
        { value: "moral-4-6", label: "Moral Level 4-6", count: 1070, type: "moral" },
        { value: "moral-7-9", label: "Moral Level 7-9", count: 158, type: "moral" },
        { value: "region-us", label: "United States", count: 350, type: "region" },
        { value: "region-europe", label: "Europe", count: 435, type: "region" }
      ]
    };
  } catch (error) {
    console.error('Error getting demographics for targeting:', error);
    return {
      targetGroups: []
    };
  }
};
