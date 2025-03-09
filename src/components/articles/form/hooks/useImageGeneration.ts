
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
    let attempt = 1;
    
    try {
      toast.info('Generating image...');

      // Try to generate the image with retries
      while (attempt <= MAX_RETRIES + 1) {
        try {
          // Call the generate-image edge function
          const { data, error } = await supabase.functions.invoke('generate-image', {
            body: { prompt }
          });

          if (error) {
            console.error(`Error from generate-image function (Attempt ${attempt}/${MAX_RETRIES + 1}):`, error);
            
            if (attempt <= MAX_RETRIES) {
              attempt++;
              toast.warning(`Retrying image generation (Attempt ${attempt}/${MAX_RETRIES + 1})...`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
              continue;
            }
            
            throw new Error(error.message || 'Failed to generate image');
          }

          if (!data || data.error) {
            console.error(`Error in response data (Attempt ${attempt}/${MAX_RETRIES + 1}):`, data?.error);
            
            if (attempt <= MAX_RETRIES) {
              attempt++;
              toast.warning(`Retrying image generation (Attempt ${attempt}/${MAX_RETRIES + 1})...`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
              continue;
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
        } catch (attemptError) {
          if (attempt > MAX_RETRIES) {
            throw attemptError;
          }
          attempt++;
        }
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      
      // Provide more helpful error messages
      let errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('API key')) {
        errorMessage = 'API key error - please check your OpenAI API key configuration';
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = 'OpenAI rate limit reached - please try again later';
      }
      
      toast.error(`Failed to generate image: ${errorMessage}`);
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
