
import { supabase } from '@/integrations/supabase/client';
import { MemeDbRecord } from '../types';
import { logError } from './errorLogger';

/**
 * Fetches meme records for a specific user from Supabase
 * Using explicit field selection to prevent deep type instantiation
 */
export async function fetchUserMemes(userId: string): Promise<MemeDbRecord[]> {
  try {
    // Explicitly select fields to avoid TypeScript inferring complex types
    const { data, error } = await supabase
      .from('memes')
      .select('id, image_url, meme_text, platform_tags, created_at, user_id, prompt, engagement_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Cast to MemeDbRecord[] to simplify typing
    return (data || []) as MemeDbRecord[];
  } catch (error) {
    logError('Error fetching user memes:', error);
    throw error;
  }
}
