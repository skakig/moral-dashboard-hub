
import { supabase } from '@/integrations/supabase/client';
import { MemeDbRecord } from '../types';
import { logError } from './errorLogger';

/**
 * Fetches meme records for a specific user from Supabase
 * Using a simpler type handling approach to avoid TypeScript's excessive type inference
 */
export async function fetchUserMemes(userId: string): Promise<MemeDbRecord[]> {
  try {
    // Simplify the query and avoid complex type inference
    const result = await supabase
      .from('memes')
      .select('id, image_url, meme_text, platform_tags, created_at, user_id, engagement_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (result.error) {
      throw result.error;
    }
    
    // Use a direct approach for handling the data
    // By returning an empty array if no data, or the data cast to the required type
    return (result.data || []) as MemeDbRecord[];
    
  } catch (error) {
    logError('Error fetching user memes:', error);
    throw error;
  }
}
