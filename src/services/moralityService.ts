
import { supabase } from "@/integrations/supabase/client";

/**
 * Saves or updates a user's morality data
 */
export async function saveUserMorality(data: {
  user_id: string;
  moral_level: number;
  predicted_moral_level?: number;
  contradictions_detected?: boolean;
  response_time_tracking?: Record<string, any>;
  emotional_response_patterns?: Record<string, any>;
}) {
  const { data: existingData, error: fetchError } = await supabase
    .from('user_morality')
    .select('id, moral_level, moral_progression_history')
    .eq('user_id', data.user_id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to check existing morality data: ${fetchError.message}`);
  }

  // Fix: Ensure moral_progression_history is an array
  let moral_progression_history = Array.isArray(existingData?.moral_progression_history) ?
    existingData.moral_progression_history : [];
  
  // Only add to history if level changed
  if (existingData && existingData.moral_level !== data.moral_level) {
    // Add previous level to history with timestamp
    moral_progression_history = [
      ...moral_progression_history,
      { 
        level: existingData.moral_level,
        date: new Date().toISOString()
      }
    ];
  }

  const moralityData = {
    user_id: data.user_id,
    moral_level: data.moral_level,
    moral_progression_history,
    predicted_moral_level: data.predicted_moral_level || data.moral_level,
    contradictions_detected: data.contradictions_detected || false,
    response_time_tracking: data.response_time_tracking || {},
    emotional_response_patterns: data.emotional_response_patterns || {}
  };

  if (existingData) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('user_morality')
      .update(moralityData)
      .eq('user_id', data.user_id);

    if (updateError) {
      throw new Error(`Failed to update morality data: ${updateError.message}`);
    }
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from('user_morality')
      .insert([moralityData]);

    if (insertError) {
      throw new Error(`Failed to save morality data: ${insertError.message}`);
    }
  }

  return true;
}

/**
 * Fetches a user's morality data
 */
export async function getUserMorality(userId: string) {
  const { data, error } = await supabase
    .from('user_morality')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load morality data: ${error.message}`);
  }

  return data;
}

/**
 * Records response time for analytics
 */
export async function recordResponseTime(userId: string, questionId: string, timeMs: number) {
  // Get current response time tracking
  const { data, error } = await supabase
    .from('user_morality')
    .select('response_time_tracking')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch response tracking:', error);
    return;
  }

  // Update with new response time
  const responseTimeTracking = {
    ...(data?.response_time_tracking || {}),
    [questionId]: timeMs
  };

  await supabase
    .from('user_morality')
    .update({ response_time_tracking: responseTimeTracking })
    .eq('user_id', userId);
}
