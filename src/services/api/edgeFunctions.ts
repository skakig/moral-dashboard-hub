
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Generic type for edge function responses
 */
interface EdgeFunctionResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

/**
 * Service for handling edge function calls with consistent error handling
 */
export class EdgeFunctionService {
  /**
   * Calls a Supabase edge function with robust error handling
   * @param functionName Name of the edge function
   * @param payload Request payload
   * @param options Options for the function call
   * @returns Response data or null if there was an error
   */
  static async callFunction<T>(
    functionName: string, 
    payload: any, 
    options: {
      retries?: number;
      retryDelay?: number;
      silent?: boolean;
      customErrorMessage?: string;
    } = {}
  ): Promise<T | null> {
    const { 
      retries = 2, 
      retryDelay = 1000, 
      silent = false,
      customErrorMessage
    } = options;
    
    let currentAttempt = 0;
    
    while (currentAttempt <= retries) {
      currentAttempt++;
      
      try {
        if (!silent && currentAttempt > 1) {
          toast.warning(`Retrying... (Attempt ${currentAttempt}/${retries + 1})`);
        }
        
        console.log(`Calling edge function: ${functionName} (Attempt ${currentAttempt})`);
        
        const response = await supabase.functions.invoke<EdgeFunctionResponse<T>>(
          functionName,
          { body: payload }
        );
        
        // Handle HTTP errors
        if (response.error) {
          console.error(`Edge function error (${functionName}):`, response.error);
          throw new Error(response.error.message || `Failed to call ${functionName}`);
        }
        
        // Handle function errors from the response body
        if (response.data?.error) {
          console.error(`Function response error (${functionName}):`, response.data.error);
          throw new Error(response.data.error);
        }
        
        console.log(`Edge function ${functionName} succeeded`);
        return response.data as T;
      } catch (error: any) {
        console.error(`Error in ${functionName} (Attempt ${currentAttempt}/${retries + 1}):`, error);
        
        // If we've used all retries, throw the error
        if (currentAttempt > retries) {
          if (!silent) {
            toast.error(customErrorMessage || `Failed to run ${functionName}: ${error.message}`);
          }
          return null;
        }
        
        // Otherwise wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    return null;
  }

  /**
   * Generate speech from text using the voice generation edge function
   */
  static async generateVoice(text: string, voiceId: string) {
    // Try ElevenLabs first, fallback to OpenAI TTS if it fails
    try {
      console.log(`Generating voice with ElevenLabs for: ${text.substring(0, 50)}...`);
      
      const result = await this.callFunction<{
        audioUrl: string;
        fileName: string;
        base64Audio: string;
        service: string;
      }>(
        'generate-voice',
        { text, voiceId },
        { 
          retries: 1,
          silent: true,
          customErrorMessage: 'Voice generation with ElevenLabs failed. Trying backup service...'
        }
      );
      
      if (result) {
        return result;
      }
      
      // If ElevenLabs fails, try with OpenAI
      console.log("Falling back to OpenAI TTS");
      return await this.callFunction<{
        audioUrl: string;
        fileName: string;
        base64Audio: string;
        service: string;
      }>(
        'generate-voice-openai',
        { text, voice: "alloy" }, // OpenAI uses different voice IDs
        { 
          customErrorMessage: 'Voice generation failed. Please try again later or contact support.'
        }
      );
    } catch (error) {
      console.error("All voice generation attempts failed:", error);
      toast.error('Voice generation failed. Please try again later.');
      return null;
    }
  }

  /**
   * Generate an image using the image generation edge function
   */
  static async generateImage(prompt: string, platform?: string) {
    // Define image dimensions based on platform
    let width = 1024;
    let height = 1024;
    
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
        case 'linkedin':
          width = 1200;
          height = 627;
          break;
        case 'youtube':
          width = 1280;
          height = 720;
          break;
        case 'tiktok':
          width = 1080;
          height = 1920;
          break;
        case 'pinterest':
          width = 1000;
          height = 1500;
          break;
        default:
          // Default square image
          width = 1024;
          height = 1024;
      }
    }
    
    console.log(`Generating image for platform: ${platform}, dimensions: ${width}x${height}`);
    
    return this.callFunction<{
      image: string;
    }>(
      'generate-image',
      { prompt, width, height, platform },
      { 
        customErrorMessage: 'Image generation failed. Please try again later or contact support.'
      }
    );
  }

  /**
   * Generate article content using the article generation edge function
   */
  static async generateArticle(params: {
    theme: string;
    keywords?: string[];
    contentType?: string;
    moralLevel?: number;
    platform?: string;
    contentLength?: string;
    tone?: string;
  }) {
    return this.callFunction<{
      title: string;
      content: string;
      metaDescription?: string;
      keywords?: string[];
    }>(
      'generate-article',
      params,
      { 
        customErrorMessage: 'Content generation failed. Please try again later or contact support.'
      }
    );
  }
}
