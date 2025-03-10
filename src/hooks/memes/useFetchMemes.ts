
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Meme } from '@/types/meme';
import { logError } from './utils/errorLogger';
import { dbRecordToMeme } from './utils/memeMappers';
import { fetchUserMemes } from './utils/fetchUserMemes';

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
      
      // Fetch memes with the utility function
      const memeRecords = await fetchUserMemes(authData.user.id);
      
      // Transform records safely
      const transformedMemes = memeRecords.map(record => dbRecordToMeme(record));
      
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
