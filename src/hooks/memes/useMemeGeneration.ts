
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMemeGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate meme image function - connects to OpenAI DALL-E API through edge function
  const generateMemeImage = async (prompt: string, platform?: string): Promise<string | null> => {
    try {
      setIsGenerating(true);
      
      // Get current user session to ensure user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error('You must be logged in to generate memes');
        return null;
      }
      
      // Call the edge function for image generation
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt,
          platform: platform || 'twitter',
          width: 1024,
          height: 1024
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.image) {
        throw new Error('No image was generated');
      }
      
      toast.success('Meme image generated!');
      return data.image;
    } catch (err: any) {
      toast.error(`Error generating image: ${err.message}`);
      console.error('Image generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateMemeImage
  };
}
