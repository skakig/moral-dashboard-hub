
import { supabase } from '@/integrations/supabase/client';
import { MemeDbRecord } from '../types';
import { logError } from './errorLogger';

/**
 * Fetches meme records for a specific user from Supabase
 * Using a type-safe approach to avoid excessive type instantiation
 */
export async function fetchUserMemes(userId: string): Promise<MemeDbRecord[]> {
  try {
    // Use a simple approach that avoids TypeScript's complex type inference
    const result = await supabase
      .from('memes')
      .select('id, image_url, meme_text, platform_tags, created_at, prompt, engagement_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (result.error) {
      throw result.error;
    }
    
    // Cast to a safe type using a two-step assertion to bypass TypeScript's type checking
    return (result.data || []) as unknown as MemeDbRecord[];
  } catch (error) {
    logError('Error fetching user memes:', error);
    throw error;
  }
}
