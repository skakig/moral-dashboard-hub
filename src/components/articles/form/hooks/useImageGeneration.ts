
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useImageGeneration() {
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const generateImage = async (prompt: string) => {
    if (!prompt) {
      toast.error('Please enter a prompt for image generation');
      return null;
    }

    setLoading(true);
    try {
      toast.info('Generating image...');

      // Call the generate-image edge function
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt }
      });

      if (error) {
        console.error("Error from generate-image function:", error);
        
        // If we've retried less than MAX_RETRIES, try again
        if (retryCount < MAX_RETRIES) {
          setRetryCount(retryCount + 1);
          toast.warning(`Retrying image generation (Attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          return generateImage(prompt);
        }
        
        throw new Error(error.message || 'Failed to generate image');
      }

      if (!data || data.error) {
        console.error("Error in response data:", data?.error);
        
        // If we've retried less than MAX_RETRIES, try again
        if (retryCount < MAX_RETRIES) {
          setRetryCount(retryCount + 1);
          toast.warning(`Retrying image generation (Attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          return generateImage(prompt);
        }
        
        throw new Error(data?.error || 'Failed to generate image');
      }

      if (!data.image) {
        throw new Error('No image data returned');
      }

      // Reset retry count on success
      setRetryCount(0);
      
      setGeneratedImage(data.image);
      toast.success('Image generated successfully!');
      return data.image;
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(`Failed to generate image: ${error.message || 'Unknown error'}`);
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
