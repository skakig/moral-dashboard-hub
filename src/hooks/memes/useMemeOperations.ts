
import { useState } from 'react';
import { useAuthStatus } from './useAuthStatus';
import { useMemeDatabase } from './useMemeDatabase';
import { MemeFormData, Meme } from '@/types/meme';
import { generateMemeImage, downloadMeme, shareMeme } from './memeUtils';
import { UseMemeOperationsReturn } from './types';

export function useMemeOperations(): UseMemeOperationsReturn {
  const { isAuthenticated } = useAuthStatus();
  const { 
    savedMemes, 
    isLoading, 
    error, 
    isSaving, 
    saveMeme, 
    fetchMemes, 
    deleteMeme 
  } = useMemeDatabase();
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate meme image function wrapper
  const generateMemeImageWrapper = async (prompt: string, platform?: string): Promise<string | null> => {
    try {
      setIsGenerating(true);
      return await generateMemeImage(prompt, platform);
    } finally {
      setIsGenerating(false);
    }
  };
  
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
    generateMemeImage: generateMemeImageWrapper,
    downloadMeme,
    shareMeme
  };
}
