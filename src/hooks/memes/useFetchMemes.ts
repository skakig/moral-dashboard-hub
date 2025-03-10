
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Meme } from '@/types/meme';
import { logError } from './utils/errorLogger';
import { dbRecordToMeme } from './utils/memeMappers';
import { MemeDbRecord } from './types';

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
      
      // Use a type assertion approach that avoids deep type instantiation
      // by completely separating the query from the result handling
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
      
      // Process each record individually to avoid type recursion
      const transformedMemes: Meme[] = [];
      for (let i = 0; i < data.length; i++) {
        const record = data[i] as unknown as MemeDbRecord;
        transformedMemes.push(dbRecordToMeme(record));
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
