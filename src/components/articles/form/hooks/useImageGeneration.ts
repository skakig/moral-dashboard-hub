
import { useState } from 'react';
import { toast } from 'sonner';
import { EdgeFunctionService } from '@/services/api/edgeFunctions';

export function useImageGeneration() {
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async (prompt: string, platform?: string) => {
    if (!prompt) {
      toast.error('Please enter a prompt for image generation');
      return null;
    }

    setLoading(true);
    
    try {
      toast.info('Generating image...');

      // Generate image using the edge function
      const result = await EdgeFunctionService.generateImage(prompt);
      
      if (!result) {
        throw new Error('Image generation failed');
      }

      setGeneratedImage(result.image);
      return result.image;
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(`Image generation failed: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateImage,
    loading,
    generatedImage,
    setGeneratedImage
  };
}
