
import { useState } from 'react';
import { toast } from 'sonner';
import { EdgeFunctionService } from '@/services/api/edgeFunctions';

export function useImageGeneration() {
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async (prompt: string) => {
    if (!prompt) {
      toast.error('Please enter a prompt for image generation');
      return null;
    }

    setLoading(true);
    
    try {
      toast.info('Generating image...');
      console.log('Sending image generation request with prompt:', prompt);

      // Structure the request payload properly
      const payload = { prompt: prompt };

      // Generate image using the edge function service
      const result = await EdgeFunctionService.generateImage(prompt);
      
      if (!result) {
        throw new Error('Image generation failed');
      }

      setGeneratedImage(result.image);
      toast.success('Image generated successfully!');
      return result.image;
    } catch (error: any) {
      console.error('Error generating image:', error);
      // The error is already handled by the service
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
