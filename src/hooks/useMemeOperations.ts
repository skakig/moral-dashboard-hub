
import { useEffect } from 'react';
import { useGenerateMemeImage, useMemeStorage, useMemeDownload, useMemeSharing } from './meme';

export function useMemeOperations() {
  // Combine the hooks
  const { isGenerating, generateMemeImage } = useGenerateMemeImage();
  const { isSaving, isLoading, savedMemes, saveMeme, fetchMemes, deleteMeme } = useMemeStorage();
  const { downloadMeme } = useMemeDownload();
  const { shareMeme } = useMemeSharing();

  // Fetch memes on initial load
  useEffect(() => {
    fetchMemes();
  }, []);

  return {
    // Image generation
    isGenerating,
    generateMemeImage,
    
    // Storage operations
    isSaving,
    isLoading,
    savedMemes,
    saveMeme,
    fetchMemes,
    deleteMeme,
    
    // Download functionality
    downloadMeme,
    
    // Sharing functionality
    shareMeme
  };
}
