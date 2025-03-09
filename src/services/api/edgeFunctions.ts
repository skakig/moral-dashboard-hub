
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getPreferredServiceForFunction } from "@/services/functionMappingService";

interface GenerateArticleParams {
  theme: string;
  keywords?: string[];
  contentType: string;
  moralLevel: number;
  platform?: string;
  contentLength?: string;
  tone?: string;
  demographicTargeting?: boolean;
  targetDemographics?: string[];
}

export class EdgeFunctionService {
  static async generateArticle(params: GenerateArticleParams) {
    try {
      // Determine which service to use for this function
      const serviceMapping = await getPreferredServiceForFunction('generate-article');
      const serviceName = serviceMapping.preferred_service || 'OpenAI';
      
      console.log(`Using ${serviceName} for article generation`);
      
      // Add branding information from settings if available
      const brandingParams = await this.getBrandingParams();
      
      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: {
          ...params,
          ...brandingParams,
          service: serviceName
        }
      });
      
      if (error) {
        console.error("Error generating article:", error);
        toast.error(`Failed to generate content: ${error.message}`);
        return null;
      }
      
      if (!data) {
        toast.error("No data returned from content generation");
        return null;
      }
      
      if (data.error) {
        toast.error(`Error generating content: ${data.error}`);
        return null;
      }
      
      return data;
    } catch (error: any) {
      console.error("Error calling generate-article function:", error);
      toast.error(`Error generating content: ${error.message}`);
      return null;
    }
  }
  
  static async generateVoice(params: { content: string; voice?: string }) {
    try {
      // Determine which service to use for this function
      const serviceMapping = await getPreferredServiceForFunction('generate-voice');
      const serviceName = serviceMapping.preferred_service || 'ElevenLabs';
      
      console.log(`Using ${serviceName} for voice generation`);
      
      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('generate-voice', {
        body: {
          ...params,
          service: serviceName
        }
      });
      
      if (error) {
        console.error("Error generating voice:", error);
        toast.error(`Failed to generate voice: ${error.message}`);
        return null;
      }
      
      if (!data) {
        toast.error("No data returned from voice generation");
        return null;
      }
      
      if (data.error) {
        toast.error(`Error generating voice: ${data.error}`);
        return null;
      }
      
      return data;
    } catch (error: any) {
      console.error("Error calling generate-voice function:", error);
      toast.error(`Error generating voice: ${error.message}`);
      return null;
    }
  }
  
  static async generateImage(params: { prompt: string }) {
    try {
      // Determine which service to use for this function
      const serviceMapping = await getPreferredServiceForFunction('generate-image');
      const serviceName = serviceMapping.preferred_service || 'StableDiffusion';
      
      console.log(`Using ${serviceName} for image generation`);
      
      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          ...params,
          service: serviceName
        }
      });
      
      if (error) {
        console.error("Error generating image:", error);
        toast.error(`Failed to generate image: ${error.message}`);
        return null;
      }
      
      if (!data) {
        toast.error("No data returned from image generation");
        return null;
      }
      
      if (data.error) {
        toast.error(`Error generating image: ${data.error}`);
        return null;
      }
      
      return data;
    } catch (error: any) {
      console.error("Error calling generate-image function:", error);
      toast.error(`Error generating image: ${error.message}`);
      return null;
    }
  }
  
  // Get branding parameters from settings
  static async getBrandingParams() {
    try {
      const { data, error } = await supabase
        .from('branding_settings')
        .select('*')
        .limit(1)
        .single();
        
      if (error) {
        console.warn("Could not retrieve branding settings:", error);
        return {};
      }
      
      if (!data) return {};
      
      return {
        branding: {
          companyName: data.company_name,
          tagline: data.tagline,
          websiteUrl: data.website_url,
          youtubeChannel: data.youtube_channel,
          instagramHandle: data.instagram_handle,
          tiktokHandle: data.tiktok_handle,
          twitterHandle: data.twitter_handle,
          facebookPage: data.facebook_page
        }
      };
    } catch (error) {
      console.warn("Error retrieving branding settings:", error);
      return {};
    }
  }
}
