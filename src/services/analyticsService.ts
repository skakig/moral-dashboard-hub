
import { supabase } from "@/integrations/supabase/client";

// Track content views
export async function trackContentView(userId: string, contentId: string, contentType: string = 'article') {
  try {
    // Since the content_views table doesn't exist in our Supabase instance,
    // we'll just log this for now and return
    console.info('Content view tracked:', { userId, contentId, contentType });
    return true;
  } catch (error) {
    console.error("Error tracking content view:", error);
    return false;
  }
}

// Update user engagement data
export async function updateUserEngagement(userId: string, activityType: string, engagementScore: number) {
  try {
    // Since the user_engagements table doesn't exist, we'll just log this
    console.info('User engagement updated:', { userId, activityType, engagementScore });
    return true;
  } catch (error) {
    console.error("Error updating user engagement:", error);
    return false;
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
  // Changed to an array format to make it iterable
  return [
    { gender: 'Male', moral_level: 1, user_count: 5 },
    { gender: 'Male', moral_level: 2, user_count: 10 },
    { gender: 'Male', moral_level: 3, user_count: 15 },
    { gender: 'Male', moral_level: 4, user_count: 25 },
    { gender: 'Male', moral_level: 5, user_count: 20 },
    { gender: 'Male', moral_level: 6, user_count: 15 },
    { gender: 'Male', moral_level: 7, user_count: 5 },
    { gender: 'Male', moral_level: 8, user_count: 3 },
    { gender: 'Male', moral_level: 9, user_count: 2 },
    { gender: 'Female', moral_level: 1, user_count: 3 },
    { gender: 'Female', moral_level: 2, user_count: 8 },
    { gender: 'Female', moral_level: 3, user_count: 12 },
    { gender: 'Female', moral_level: 4, user_count: 22 },
    { gender: 'Female', moral_level: 5, user_count: 25 },
    { gender: 'Female', moral_level: 6, user_count: 18 },
    { gender: 'Female', moral_level: 7, user_count: 8 },
    { gender: 'Female', moral_level: 8, user_count: 3 },
    { gender: 'Female', moral_level: 9, user_count: 1 }
  ];
}

export function getCountryMoralDistribution() {
  return [
    { country: 'USA', avg_moral_level: 6.2, user_count: 350 },
    { country: 'Canada', avg_moral_level: 6.5, user_count: 120 },
    { country: 'UK', avg_moral_level: 6.1, user_count: 180 },
    { country: 'Germany', avg_moral_level: 6.3, user_count: 150 },
    { country: 'France', avg_moral_level: 5.8, user_count: 110 },
    { country: 'Japan', avg_moral_level: 6.4, user_count: 90 },
    { country: 'Australia', avg_moral_level: 6.2, user_count: 80 },
    { country: 'Brazil', avg_moral_level: 5.5, user_count: 70 },
    { country: 'India', avg_moral_level: 5.7, user_count: 60 },
    { country: 'China', avg_moral_level: 5.6, user_count: 40 }
  ];
}

export function getAnalyticsSummary() {
  return {
    total_users: 1250,
    total_influencers: 50,
    average_moral_level: 5.7,
    average_engagement: 7.3,
    average_conversion_rate: 0.15
  };
}
