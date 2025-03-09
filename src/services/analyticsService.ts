
import { supabase } from "@/integrations/supabase/client";

// Track content views
export async function trackContentView(userId: string, contentId: string, contentType: string = 'article') {
  try {
    // Check if the table exists first to avoid errors
    const { error: checkError } = await supabase
      .from('content_views')
      .select('id')
      .limit(1);
    
    // If table doesn't exist, log and return quietly
    if (checkError) {
      console.warn('Content views tracking is not available: Table not configured');
      return;
    }
    
    // Insert the view
    const { error } = await supabase
      .from('content_views')
      .insert([
        { 
          user_id: userId, 
          content_id: contentId,
          content_type: contentType
        }
      ]);

    if (error) throw error;
    
  } catch (error) {
    console.error("Error tracking content view:", error);
  }
}

// Update user engagement data
export async function updateUserEngagement(userId: string, activityType: string, engagementScore: number) {
  try {
    // Check if user_engagements table exists
    const { error: checkError } = await supabase
      .from('user_engagements')
      .select('id')
      .limit(1);
      
    // If table doesn't exist, log and return quietly
    if (checkError) {
      console.warn('User engagement tracking is not available: Table not configured');
      return;
    }
    
    // Update the engagement
    const { error } = await supabase
      .from('user_engagements')
      .insert([
        { 
          user_id: userId, 
          activity_type: activityType,
          engagement_score: engagementScore
        }
      ]);

    if (error) throw error;
    
  } catch (error) {
    console.error("Error updating user engagement:", error);
  }
}

// Mock demographics data for targeting
export function getDemographicTargeting() {
  // Return mock data for now
  return {
    ageRanges: [
      { id: '18-24', label: '18-24 years' },
      { id: '25-34', label: '25-34 years' },
      { id: '35-44', label: '35-44 years' },
      { id: '45-54', label: '45-54 years' },
      { id: '55-64', label: '55-64 years' },
      { id: '65+', label: '65+ years' }
    ],
    genders: [
      { id: 'male', label: 'Male' },
      { id: 'female', label: 'Female' },
      { id: 'non-binary', label: 'Non-binary' },
      { id: 'other', label: 'Other' }
    ],
    regions: [
      { id: 'north-america', label: 'North America' },
      { id: 'europe', label: 'Europe' },
      { id: 'asia', label: 'Asia' },
      { id: 'africa', label: 'Africa' },
      { id: 'south-america', label: 'South America' },
      { id: 'oceania', label: 'Oceania' }
    ],
    interests: [
      { id: 'technology', label: 'Technology' },
      { id: 'health', label: 'Health & Wellness' },
      { id: 'finance', label: 'Finance' },
      { id: 'entertainment', label: 'Entertainment' },
      { id: 'education', label: 'Education' },
      { id: 'spirituality', label: 'Spirituality' }
    ]
  };
}

// Mock functions for demographics data
export function getAgeRangeDistribution() {
  return {
    labels: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    data: [15, 30, 25, 15, 10, 5],
  };
}

export function getGenderMoralDistribution() {
  return {
    male: {
      labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8', 'Level 9'],
      data: [5, 10, 15, 25, 20, 15, 5, 3, 2],
    },
    female: {
      labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8', 'Level 9'],
      data: [3, 8, 12, 22, 25, 18, 8, 3, 1],
    },
    other: {
      labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8', 'Level 9'],
      data: [4, 9, 14, 24, 22, 16, 7, 3, 1],
    },
  };
}

export function getCountryMoralDistribution() {
  return {
    data: [
      { country: 'USA', value: 6.2 },
      { country: 'Canada', value: 6.5 },
      { country: 'UK', value: 6.1 },
      { country: 'Germany', value: 6.3 },
      { country: 'France', value: 5.8 },
      { country: 'Japan', value: 6.4 },
      { country: 'Australia', value: 6.2 },
      { country: 'Brazil', value: 5.5 },
      { country: 'India', value: 5.7 },
      { country: 'China', value: 5.6 },
    ],
  };
}

export function getAnalyticsSummary() {
  return {
    totalUsers: 1250,
    activeUsers: 850,
    averageMoralLevel: 5.7,
    completedAssessments: 2750,
    mostActiveCountries: ['USA', 'UK', 'Canada', 'Australia', 'Germany'],
    mostImprovedSegment: 'Female 25-34',
    mostCommonMoralLevel: 5,
  };
}
