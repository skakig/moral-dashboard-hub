
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Meme } from '@/types/meme';
import { logError } from './utils/errorLogger';
import { dbRecordToMeme } from './utils/memeMappers';

/**
 * Hook for fetching user's saved memes from Supabase
 */
export function useFetchMemes() {
  const [savedMemes, setSavedMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Fetch user's memes from the database
   */
  const fetchMemes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verify authentication
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) {
        // Not authenticated, return empty array
        setSavedMemes([]);
        return;
      }
      
      // Fetch memes for the current user
      const { data, error: fetchError } = await supabase
        .from('memes')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false });
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (!data || data.length === 0) {
        setSavedMemes([]);
        return;
      }
      
      // Transform each database record to a Meme object
      const transformedMemes: Meme[] = [];
      
      for (let i = 0; i < data.length; i++) {
        // Using the mapper function to convert each record
        const meme = dbRecordToMeme(data[i]);
        transformedMemes.push(meme);
      }
      
      setSavedMemes(transformedMemes);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load memes';
      setError(errorMsg);
      logError('Error fetching memes:', err);
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
