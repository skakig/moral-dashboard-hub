
import { supabase } from '@/integrations/supabase/client';
import { MemeDbRecord } from '../types';
import { logError } from './errorLogger';

/**
 * Fetches meme records for a specific user from Supabase
 * Using a simplified approach to avoid TypeScript's excessive type inference
 */
export async function fetchUserMemes(userId: string): Promise<MemeDbRecord[]> {
  try {
    // Use any for the initial query result to avoid complex type inference
    const { data, error } = await supabase
      .from('memes')
      .select('id, image_url, meme_text, platform_tags, created_at, prompt, engagement_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // Handle the null case explicitly and treat data as a simple array
    if (!data) {
      return [];
    }
    
    // Cast the data array to MemeDbRecord[] without nested inference
    return data as MemeDbRecord[];
  } catch (error) {
    logError('Error fetching user memes:', error);
    throw error;
  }
}
