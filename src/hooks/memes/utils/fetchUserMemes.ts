
import { supabase } from '@/integrations/supabase/client';
import { MemeDbRecord } from '../types';
import { logError } from './errorLogger';

/**
 * Fetches meme records for a specific user from Supabase
 * Using a safer approach to avoid type instantiation issues
 */
export async function fetchUserMemes(userId: string): Promise<MemeDbRecord[]> {
  try {
    // Execute query with limited type checking to avoid excessive type instantiation
    const response = await supabase
      .from('memes')
      .select('id, image_url, meme_text, platform_tags, created_at, prompt, engagement_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (response.error) {
      throw response.error;
    }
    
    // First convert to unknown to avoid TypeScript's type checking, then to our expected type
    const data = (response.data || []) as unknown as MemeDbRecord[];
    
    return data;
  } catch (error) {
    logError('Error fetching user memes:', error);
    throw error;
  }
}
