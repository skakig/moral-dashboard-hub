
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EdgeFunctionResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

export class EdgeFunctionService {
  static async callFunction<T>(
    functionName: string, 
    payload: any, 
    options: {
      retries?: number;
      retryDelay?: number;
      silent?: boolean;
      customErrorMessage?: string;
      timeout?: number;
    } = {}
  ): Promise<T | null> {
    const { 
      retries = 2, 
      retryDelay = 1500, 
      silent = false,
      customErrorMessage,
      timeout = 60000 // Default timeout to 60 seconds
    } = options;
    
    let currentAttempt = 0;
    
    while (currentAttempt <= retries) {
      currentAttempt++;
      
      try {
        if (!silent && currentAttempt > 1) {
          toast.warning(`Retrying request... (Attempt ${currentAttempt}/${retries + 1})`);
        }
        
        console.log(`Calling edge function ${functionName} with payload:`, 
          functionName === 'generate-voice' 
            ? { voiceId: payload.voiceId, textLength: payload.text?.length || 0 } 
            : payload
        );
        
        // Create a promise that will be rejected if the timeout is reached
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Request to ${functionName} timed out after ${timeout}ms`)), timeout);
        });
        
        // Create the actual request promise
        const requestPromise = supabase.functions.invoke<EdgeFunctionResponse<T>>(
          functionName,
          { 
            body: payload
          }
        );
        
        // Race the request against the timeout
        const response = await Promise.race([requestPromise, timeoutPromise]);
        
        if (!response) {
          throw new Error(`Received empty response from ${functionName}`);
        }
        
        // Check if the response contains an error property
        if (response.error) {
          console.error(`Error from ${functionName}:`, response.error);
          throw new Error(response.error.message || `Failed to call ${functionName}`);
        }
        
        // Check if the data property contains an error property
        if (response.data?.error) {
          console.error(`Error in response data from ${functionName}:`, response.data.error);
          throw new Error(response.data.error);
        }
        
        console.log(`Edge function ${functionName} response success:`, 
          functionName === 'generate-voice' 
            ? { success: true, audioUrlLength: (response.data as any)?.audioUrl?.length || 0 }
            : { success: true }
        );
        
        return response.data as T;
      } catch (error: any) {
        console.error(`Error in ${functionName} (Attempt ${currentAttempt}/${retries + 1}):`, error);
        
        if (currentAttempt > retries) {
          if (!silent) {
            toast.error(customErrorMessage || `Failed to run ${functionName}: ${error.message}`);
          }
          throw error;
        }
        
        // Exponential backoff with jitter for retries
        const baseDelay = retryDelay * Math.pow(2, currentAttempt - 1);
        const jitter = Math.random() * 500; // Add up to 500ms of jitter
        const delay = baseDelay + jitter;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return null;
  }

  static async generateVoice(text: string, voiceId: string) {
    try {
      if (!text || text.trim() === '') {
        throw new Error("Text content is required for voice generation");
      }
      
      // Trim text if it's very long to avoid API issues
      const trimmedText = text.length > 3000 ? text.substring(0, 3000) + "..." : text;
      
      return await this.callFunction<{
        audioUrl: string;
        fileName: string;
        base64Audio: string;
        service: string;
      }>(
        'generate-voice',
        { text: trimmedText, voiceId },
        { 
          retries: 1, // Reduce retries for voice generation as it's expensive
          retryDelay: 2000,
          timeout: 60000, // 60 seconds for voice generation
          customErrorMessage: 'Voice generation failed. Please try again with shorter text.'
        }
      );
    } catch (error) {
      console.error("Voice generation error:", error);
      throw error;
    }
  }

  static async generateArticle(params: {
    theme: string;
    keywords?: string[] | null;
    contentType?: string;
    moralLevel?: number;
    platform?: string;
    contentLength?: string;
    tone?: string;
  }) {
    try {
      // Log that we're generating content
      console.log('Generating article with parameters:', params);
      
      // Ensure we have the required parameters
      if (!params.theme || !params.theme.trim()) {
        throw new Error("Theme is required for article generation");
      }
      
      // Ensure keywords is an array if provided
      const normalizedParams = {
        ...params,
        keywords: Array.isArray(params.keywords) ? params.keywords : 
                  (typeof params.keywords === 'string' ? [params.keywords] : [])
      };
      
      return await this.callFunction<{
        title: string;
        content: string;
        metaDescription?: string;
        keywords?: string[];
      }>(
        'generate-article',
        normalizedParams,
        { 
          retries: 3, // Increased retries for article generation
          retryDelay: 3000,
          timeout: 90000, // Increased timeout for article generation to 90 seconds
          customErrorMessage: 'Content generation failed. Please try again later or with a simpler theme.'
        }
      );
    } catch (error) {
      console.error("Article generation error:", error);
      throw error;
    }
  }

  static async generateImage(prompt: string) {
    try {
      console.log('Calling generateImage with prompt:', prompt);
      
      return await this.callFunction<{
        image: string;
      }>(
        'generate-image',
        { prompt },
        { 
          retries: 2,
          retryDelay: 2000,
          customErrorMessage: 'Image generation failed. Please try again later.'
        }
      );
    } catch (error) {
      console.error("Image generation error:", error);
      throw error;
    }
  }
}
