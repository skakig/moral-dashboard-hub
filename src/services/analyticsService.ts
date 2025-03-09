
import { supabase } from "@/integrations/supabase/client";

// Track when a user views content
export const trackContentView = async (contentId: string, contentType: 'article' | 'assessment' | 'video') => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) return; // Only track for authenticated users
    
    // Record the view
    await supabase.from('content_views').insert({
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      viewed_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error tracking content view:', error);
  }
};

// Update user engagement score
export const updateUserEngagement = async (userId: string, actionType: string, points = 1) => {
  try {
    // Fetch current engagement score
    const { data: userData, error: fetchError } = await supabase
      .from('user_profiles')
      .select('engagement_score')
      .eq('user_id', userId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentScore = userData?.engagement_score || 0;
    
    // Update score
    await supabase
      .from('user_profiles')
      .update({ 
        engagement_score: currentScore + points,
        last_activity: new Date().toISOString(),
        last_action_type: actionType
      })
      .eq('user_id', userId);
      
  } catch (error) {
    console.error('Error updating user engagement:', error);
  }
};

// Get demographics data for charts
export const getDemographicsData = async () => {
  try {
    const { data, error } = await supabase
      .from('user_demographics')
      .select('age_group, gender, location, moral_level')
      .limit(1000);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching demographics data:', error);
    return [];
  }
};

// Function to get demographic targeting suggestions
export const getDemographicTargeting = async (theme: string) => {
  try {
    // This could be connected to an AI service or other data source
    // For now, we'll return mock data
    return {
      ageGroups: ['18-24', '25-34'],
      genders: ['all'],
      locations: ['United States', 'Europe'],
      moralLevels: [4, 5, 6]
    };
  } catch (error) {
    console.error('Error getting demographic targeting:', error);
    return {
      ageGroups: [],
      genders: [],
      locations: [],
      moralLevels: []
    };
  }
};
