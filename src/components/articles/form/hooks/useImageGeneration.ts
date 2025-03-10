
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
      console.log('Generating image with prompt:', prompt);
      
      const result = await EdgeFunctionService.generateImage(prompt);
      
      if (!result) {
        throw new Error('Image generation failed');
      }

      setGeneratedImage(result.image);
      toast.success('Image generated successfully!');
      return result.image;
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(error.message || 'Failed to generate image');
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
