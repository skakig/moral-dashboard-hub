
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Meme } from '@/types/meme';
import { MemeDbRecord } from './types';

export function useFetchMemes() {
  const [savedMemes, setSavedMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user's memes
  const fetchMemes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verify authentication
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) {
        setSavedMemes([]);
        return;
      }
      
      // Fetch memes for the current user
      const { data, error } = await supabase
        .from('memes')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        setSavedMemes([]);
        return;
      }
      
      // Process data and transform to Meme array
      const memes: Meme[] = [];
      
      // Manual type mapping to avoid type recursion issues
      for (const item of data) {
        // Use any as an intermediate type to avoid deep recursion
        const dbRecord = item as any as MemeDbRecord;
        
        const meme: Meme = {
          id: dbRecord.id,
          prompt: dbRecord.prompt || "",
          imageUrl: dbRecord.image_url || "",
          topText: "",
          bottomText: "",
          platform: Array.isArray(dbRecord.platform_tags) ? dbRecord.platform_tags[0] : undefined,
          hashtags: Array.isArray(dbRecord.platform_tags) ? dbRecord.platform_tags.slice(1) : [],
          created_at: dbRecord.created_at,
          user_id: dbRecord.user_id,
          engagement_score: dbRecord.engagement_score || 0
        };
        
        // Parse the meme text JSON if present
        try {
          if (typeof dbRecord.meme_text === 'string') {
            const parsed = JSON.parse(dbRecord.meme_text);
            meme.topText = parsed?.topText || "";
            meme.bottomText = parsed?.bottomText || "";
          }
        } catch (e) {
          console.error("Error parsing meme text for meme ID:", dbRecord.id, e);
        }
        
        memes.push(meme);
      }
      
      setSavedMemes(memes);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load memes');
      console.error('Error fetching memes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    savedMemes,
    isLoading,
    error,
    fetchMemes
  };
}
