
import { supabase } from '@/integrations/supabase/client';
import { MemeDbRecord } from '../types';
import { logError } from './errorLogger';

/**
 * Fetches meme records for a specific user from Supabase
 * Using explicit type handling to avoid TypeScript's excessive type inference
 */
export async function fetchUserMemes(userId: string): Promise<MemeDbRecord[]> {
  try {
    // First check which columns actually exist in the memes table
    const { data, error } = await supabase
      .from('memes')
      .select('id, image_url, meme_text, platform_tags, created_at, user_id, engagement_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // Handle the null case explicitly
    if (!data) {
      return [];
    }
    
    // Use a type assertion that breaks the deep inference chain
    // by first casting to unknown then to our target type
    return (data as unknown) as MemeDbRecord[];
  } catch (error) {
    logError('Error fetching user memes:', error);
    throw error;
  }
}
