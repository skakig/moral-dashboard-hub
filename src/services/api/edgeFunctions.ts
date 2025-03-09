
import { supabase } from '@/integrations/supabase/client';
import { getPreferredServiceForFunction } from '@/services/functionMappingService';

/**
 * This service handles interactions with Supabase Edge Functions.
 * It also checks for function mappings to determine which service to use.
 */
export class EdgeFunctionService {
  /**
   * Generate content using AI
   */
  static async generateContent(params: any) {
    try {
      console.log("Generating content with params:", params);
      
      // Get the preferred service for content generation
      const mapping = await getPreferredServiceForFunction('generate-content');
      const service = mapping?.service_name || 'OpenAI';
      
      console.log(`Using ${service} for content generation`);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { ...params, service }
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error generating content:', error);
      throw new Error(error.message || 'Failed to generate content');
    }
  }
  
  /**
   * Generate an image using AI
   */
  static async generateImage(prompt: string) {
    try {
      // Get the preferred service for image generation
      const mapping = await getPreferredServiceForFunction('generate-image');
      const service = mapping?.service_name || 'StableDiffusion';
      
      console.log(`Using ${service} for image generation`);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt,
          service
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error generating image:', error);
      throw new Error(error.message || 'Failed to generate image');
    }
  }
  
  /**
   * Generate voice (audio) from text
   */
  static async generateVoice(text: string) {
    try {
      if (!text) {
        throw new Error('No text provided for voice generation');
      }
      
      // Limit text to reasonable length
      const truncatedText = text.length > 4000 ? text.substring(0, 4000) : text;
      
      // Get the preferred service for voice generation
      const mapping = await getPreferredServiceForFunction('generate-voice');
      const service = mapping?.service_name || 'ElevenLabs';
      
      console.log(`Using ${service} for voice generation`);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-voice', {
        body: { 
          text: truncatedText,
          service
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error generating voice:', error);
      throw new Error(error.message || 'Failed to generate voice');
    }
  }
  
  /**
   * Generate SEO data (meta description, keywords) for content
   */
  static async generateSEOData(content: string, title: string) {
    try {
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-seo-data', {
        body: { content, title }
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error generating SEO data:', error);
      throw new Error(error.message || 'Failed to generate SEO data');
    }
  }
}
