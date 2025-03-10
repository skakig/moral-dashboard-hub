
import { useState, useEffect } from 'react';
import { Meme, MemeFormData } from '@/types/meme';
import { useSaveMeme } from './useSaveMeme';
import { useFetchMemes } from './useFetchMemes';
import { useDeleteMeme } from './useDeleteMeme';

/**
 * Combined hook for meme storage operations (fetch, save, delete)
 */
export function useMemeStorage() {
  const { isSaving, error: saveError, saveMeme } = useSaveMeme();
  const { savedMemes: fetchedMemes, isLoading: isFetching, error: fetchError, fetchMemes } = useFetchMemes();
  const { isLoading: isDeleting, error: deleteError, deleteMeme: deleteMemeFn } = useDeleteMeme();
  
  const [savedMemes, setSavedMemes] = useState<Meme[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Sync with fetched memes
  useEffect(() => {
    setSavedMemes(fetchedMemes);
  }, [fetchedMemes]);

  // Sync errors
  useEffect(() => {
    setError(saveError || fetchError || deleteError || null);
  }, [saveError, fetchError, deleteError]);

  /**
   * Enhanced save meme that updates local state
   */
  const saveNewMeme = async (memeData: MemeFormData): Promise<Meme | null> => {
    const newMeme = await saveMeme(memeData);
    
    if (newMeme) {
      // Update local state
      setSavedMemes(prevMemes => [newMeme, ...prevMemes]);
    }
    
    return newMeme;
  };

  /**
   * Enhanced delete meme that updates local state
   */
  const deleteMemeAndUpdate = async (id: string): Promise<boolean> => {
    const success = await deleteMemeFn(id);
    
    if (success) {
      // Update local state
      setSavedMemes(prevMemes => prevMemes.filter(meme => meme.id !== id));
    }
    
    return success;
  };

  return {
    savedMemes,
    isLoading: isFetching || isDeleting,
    error,
    isSaving,
    saveMeme: saveNewMeme,
    fetchMemes,
    deleteMeme: deleteMemeAndUpdate
  };
}
