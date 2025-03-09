
import { useState, useEffect } from 'react';
import { useAuthStatus } from './useAuthStatus';
import { useMemeStorage } from './useMemeStorage';
import { useMemeGeneration } from './useMemeGeneration';
import { useMemeActions } from './useMemeActions';
import { MemeFormData, Meme } from '@/types/meme';

// This is now a lightweight orchestration hook that combines the other specialized hooks
export function useMemeOperations() {
  const { isAuthenticated } = useAuthStatus();
  const { 
    savedMemes, 
    isLoading, 
    error, 
    isSaving, 
    saveMeme, 
    fetchMemes, 
    deleteMeme 
  } = useMemeStorage();
  
  const { isGenerating, generateMemeImage } = useMemeGeneration();
  const { downloadMeme, shareMeme } = useMemeActions();

  // Fetch memes on initialization if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMemes();
    }
  }, [isAuthenticated]);
  
  return {
    savedMemes,
    isLoading,
    error,
    isAuthenticated,
    isGenerating,
    isSaving,
    saveMeme,
    fetchMemes,
    deleteMeme,
    generateMemeImage,
    downloadMeme,
    shareMeme
  };
}
