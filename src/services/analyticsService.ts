
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches age range distribution data
 */
export async function getAgeRangeDistribution() {
  try {
    const { data, error } = await supabase
      .rpc('get_age_range_distribution');
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching age distribution:", error);
    return [];
  }
}

/**
 * Fetches gender distribution by moral level
 */
export async function getGenderMoralDistribution() {
  try {
    const { data, error } = await supabase
      .rpc('get_gender_moral_distribution');
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching gender/moral distribution:", error);
    return [];
  }
}

/**
 * Fetches country moral level distribution
 */
export async function getCountryMoralDistribution() {
  try {
    const { data, error } = await supabase
      .rpc('get_country_moral_distribution');
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching country/moral distribution:", error);
    return [];
  }
}

/**
 * Fetches analytics summary data
 */
export async function getAnalyticsSummary() {
  try {
    const { data, error } = await supabase
      .from('admin_analytics_summary')
      .select('*')
      .limit(1)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching analytics summary:", error);
    return null;
  }
}

/**
 * Fetches demographics data that can be used for article generation targeting
 */
export async function getDemographicsForTargeting() {
  try {
    // Get distribution of users by age range
    const ageData = await getAgeRangeDistribution();
    
    // Get distribution of users by gender and moral level
    const genderMoralData = await getGenderMoralDistribution();
    
    // Get distribution of users by country
    const countryData = await getCountryMoralDistribution();
    
    return {
      ageDistribution: ageData,
      genderMoralDistribution: genderMoralData,
      countryDistribution: countryData,
      // Process data into formats useful for targeting
      targetGroups: processTargetingGroups(ageData, genderMoralData, countryData)
    };
  } catch (error: any) {
    console.error("Error fetching demographics for targeting:", error);
    return null;
  }
}

/**
 * Process demographics data into targeting groups
 */
function processTargetingGroups(ageData: any[], genderMoralData: any[], countryData: any[]) {
  // Group by age ranges
  const ageGroups = ageData.map(item => ({
    type: 'age',
    value: item.age_range,
    count: item.user_count,
    label: `Age: ${item.age_range}`
  }));
  
  // Group by gender
  const genderGroups: any[] = [];
  const seenGenders = new Set();
  
  genderMoralData.forEach(item => {
    if (!seenGenders.has(item.gender)) {
      seenGenders.add(item.gender);
      genderGroups.push({
        type: 'gender',
        value: item.gender,
        count: genderMoralData
          .filter(d => d.gender === item.gender)
          .reduce((sum, d) => sum + d.user_count, 0),
        label: `Gender: ${item.gender}`
      });
    }
  });
  
  // Group by moral level
  const moralGroups: any[] = [];
  const seenLevels = new Set();
  
  genderMoralData.forEach(item => {
    if (!seenLevels.has(item.moral_level)) {
      seenLevels.add(item.moral_level);
      moralGroups.push({
        type: 'moral_level',
        value: item.moral_level,
        count: genderMoralData
          .filter(d => d.moral_level === item.moral_level)
          .reduce((sum, d) => sum + d.user_count, 0),
        label: `Moral Level: ${item.moral_level}`
      });
    }
  });
  
  // Top countries
  const countryGroups = countryData
    .slice(0, 10) // Top 10 countries
    .map(item => ({
      type: 'country',
      value: item.country,
      count: item.user_count,
      avgMoralLevel: item.avg_moral_level,
      label: `Country: ${item.country}`
    }));
  
  return [
    ...ageGroups,
    ...genderGroups,
    ...moralGroups,
    ...countryGroups
  ];
}
