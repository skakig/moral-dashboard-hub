
import { useState } from 'react';
import { toast } from 'sonner';
import { EdgeFunctionService } from '@/services/api/edgeFunctions';

export function useGenerateMemeImage() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate a meme image based on prompt
  const generateMemeImage = async (prompt: string, platform?: string): Promise<string | null> => {
    setIsGenerating(true);
    
    try {
      // Define dimensions based on platform
      let width = 1024;
      let height = 1024;
      
      // Adjust dimensions based on platform
      if (platform) {
        switch (platform.toLowerCase()) {
          case 'instagram':
            width = 1080;
            height = 1080;
            break;
          case 'facebook':
            width = 1200;
            height = 630;
            break;
          case 'twitter':
          case 'x':
            width = 1200;
            height = 675;
            break;
          case 'tiktok':
            width = 1080;
            height = 1920;
            break;
          default:
            width = 1024;
            height = 1024;
        }
      }
      
      // Enhance the prompt for better AI generation
      const enhancedPrompt = `Create a high-quality meme image for: ${prompt}. Make it look realistic, detailed, and suitable for a meme. Use vibrant colors and clear imagery that communicates the concept well.`;
      
      const result = await EdgeFunctionService.generateImage(enhancedPrompt, platform, width, height);
      
      if (!result || !result.image) {
        throw new Error('No image was generated');
      }
      
      return result.image;
    } catch (error) {
      console.error('Error generating meme image:', error);
      toast.error('Failed to generate image. Please try again.');
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
