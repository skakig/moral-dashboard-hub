
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
    } = {}
  ): Promise<T | null> {
    const { 
      retries = 1, 
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
        
        console.log(`Calling edge function ${functionName} (Attempt ${currentAttempt}/${retries + 1}):`, 
          functionName === 'generate-voice' 
            ? { voiceId: payload.voiceId, textLength: payload.text?.length || 0 } 
            : payload
        );
        
        const response = await supabase.functions.invoke<EdgeFunctionResponse<T>>(
          functionName,
          { 
            body: payload
          }
        );
        
        if (response.error) {
          console.error(`Edge function HTTP error (${functionName}):`, response.error);
          throw new Error(response.error.message || `Failed to call ${functionName}`);
        }
        
        if (response.data?.error) {
          console.error(`Function response error (${functionName}):`, response.data.error, response.data.details || '');
          throw new Error(response.data.error);
        }
        
        console.log(`Edge function ${functionName} response:`, 
          functionName === 'generate-voice' 
            ? { success: true, audioUrlLength: (response.data as any)?.audioUrl?.length || 0 }
            : response.data
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
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    return null;
  }

  static async generateVoice(text: string, voiceId: string) {
    try {
      return await this.callFunction<{
        audioUrl: string;
        fileName: string;
        base64Audio: string;
        service: string;
      }>(
        'generate-voice',
        { text, voiceId },
        { 
          retries: 1,
          retryDelay: 1000,
          customErrorMessage: 'Voice generation failed. Please try again later.'
        }
      );
    } catch (error) {
      console.error("Voice generation error:", error);
      throw error;
    }
  }

  static async generateImage(prompt: string) {
    console.log('Calling generateImage with prompt:', prompt);
    
    try {
      return await this.callFunction<{
        image: string;
      }>(
        'generate-image',
        { prompt },
        { 
          retries: 2,
          retryDelay: 1000,
          customErrorMessage: 'Image generation failed. Please try again later.'
        }
      );
    } catch (error) {
      console.error("Image generation error:", error);
      throw error;
    }
  }

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
        customErrorMessage: 'Content generation failed. Please try again later.'
      }
    );
  }
}
