
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates or updates user demographic information
 */
export async function saveUserDemographics(data: {
  user_id: string;
  age_range: string;
  gender: string;
  country?: string;
  region?: string;
  primary_language?: string;
  timezone?: string;
  device_type?: string;
}) {
  // Check if user already has demographics stored
  const { data: existingData, error: fetchError } = await supabase
    .from('user_demographics')
    .select('id')
    .eq('user_id', data.user_id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to check existing demographics: ${fetchError.message}`);
  }

  if (existingData) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('user_demographics')
      .update({
        age_range: data.age_range,
        gender: data.gender,
        country: data.country,
        region: data.region,
        primary_language: data.primary_language,
        timezone: data.timezone,
        device_type: data.device_type
      })
      .eq('user_id', data.user_id);

    if (updateError) {
      throw new Error(`Failed to update demographics: ${updateError.message}`);
    }
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from('user_demographics')
      .insert([data]);

    if (insertError) {
      throw new Error(`Failed to save demographics: ${insertError.message}`);
    }
  }

  return true;
}

/**
 * Fetches user demographic information
 */
export async function getUserDemographics(userId: string) {
  const { data, error } = await supabase
    .from('user_demographics')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load demographics: ${error.message}`);
  }

  return data;
}

/**
 * Detects and saves user device type
 */
export function detectAndSaveDeviceType(userId: string) {
  let deviceType = 'Desktop';
  
  // Simple detection based on screen size and user agent
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    deviceType = 'Mobile';
  } else if (/iPad|Tablet/i.test(navigator.userAgent) || 
            (navigator.maxTouchPoints > 0 && window.innerWidth < 1200)) {
    deviceType = 'Tablet';
  }

  // Update device type in demographics table
  supabase
    .from('user_demographics')
    .upsert([
      { 
        user_id: userId, 
        device_type: deviceType
      }
    ], { onConflict: 'user_id' })
    .then(({ error }) => {
      if (error) {
        console.error('Failed to save device type:', error);
      }
    });

  return deviceType;
}
