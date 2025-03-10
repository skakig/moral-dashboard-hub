
import { supabase } from '@/integrations/supabase/client';
import { MemeDbRecord } from '../types';
import { logError } from './errorLogger';

/**
 * Fetches meme records for a specific user from Supabase
 * Using a type-safe approach to avoid excessive type instantiation
 */
export async function fetchUserMemes(userId: string): Promise<MemeDbRecord[]> {
  try {
    // Avoid complex type inference by using any then casting to our known type
    const result = await supabase
      .from('memes')
      .select('id, image_url, meme_text, platform_tags, created_at, prompt, engagement_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (result.error) {
      throw result.error;
    }
    
    // Using a simpler type assertion approach to bypass TypeScript's complex inference
    return (result.data || []) as any[] as MemeDbRecord[];
  } catch (error) {
    logError('Error fetching user memes:', error);
    throw error;
  }
}
