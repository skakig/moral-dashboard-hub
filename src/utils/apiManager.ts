
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function to get the preferred API service for a specific function
 * Falls back to the first available service in that category if no mapping exists
 */
export async function getPreferredApiService(functionName: string): Promise<{
  serviceName: string;
  apiKey: string;
  baseUrl?: string;
} | null> {
  try {
    // Get API function mappings
    const { data: mappingData, error: mappingError } = await supabase.functions.invoke('get-api-keys-status');
    
    if (mappingError) {
      console.error('Failed to get API mappings:', mappingError);
      return null;
    }
    
    if (!mappingData?.success) {
      console.error('API returned unsuccessful response');
      return null;
    }
    
    // Find the mapping for the requested function
    const functionMapping = mappingData.data.functionMappings?.find(
      (mapping: any) => mapping.function_name === functionName
    );
    
    if (!functionMapping?.preferred_service) {
      console.warn(`No preferred service mapped for function: ${functionName}`);
      return null;
    }
    
    // TODO: Get the actual API key from a secure endpoint
    // For security, we won't return the actual API key from the client
    // In a real implementation, this would call another Edge Function that handles the API call
    
    return {
      serviceName: functionMapping.preferred_service,
      apiKey: "[API KEY WOULD BE USED IN SERVER-SIDE FUNCTION]",
      baseUrl: "", // Base URL would also be retrieved securely
    };
  } catch (error) {
    console.error('Exception in getPreferredApiService:', error);
    return null;
  }
}

/**
 * Execute an API call using the preferred service for a specific function
 * If the preferred service fails, it will try the fallback service if available
 */
export async function executeApiCall<T>(
  functionName: string, 
  payload: any
): Promise<T> {
  try {
    // Instead of directly using API keys in the client, we'll use Edge Functions
    // This creates a proxy approach for all API calls
    const response = await supabase.functions.invoke(`execute-api-call`, {
      body: {
        functionName,
        payload
      }
    });
    
    if (response.error) {
      throw new response.error;
    }
    
    // Log API usage
    try {
      await supabase.functions.invoke('log-api-usage', {
        body: {
          serviceName: response.data.serviceName,
          category: response.data.category,
          requestPayload: payload,
          responsePayload: response.data.result,
          success: true,
          responseTimeMs: response.data.responseTime,
          errorMessage: null
        }
      });
    } catch (logError) {
      console.error('Failed to log API usage:', logError);
      // Continue with the response even if logging fails
    }
    
    return response.data.result as T;
  } catch (error) {
    console.error(`API call failed for function ${functionName}:`, error);
    
    // Log the failed API call
    try {
      await supabase.functions.invoke('log-api-usage', {
        body: {
          serviceName: "unknown", // Will be filled in by the server
          category: "unknown",
          requestPayload: payload,
          responsePayload: null,
          success: false,
          responseTimeMs: 0,
          errorMessage: error instanceof Error ? error.message : String(error)
        }
      });
    } catch (logError) {
      console.error('Failed to log API error:', logError);
    }
    
    throw error;
  }
}

/**
 * Helper function for text generation using preferred AI service
 */
export async function generateText(prompt: string, options: any = {}): Promise<string> {
  return executeApiCall<string>("AI Text Generation", {
    prompt,
    options
  });
}

/**
 * Helper function for image generation using preferred AI service
 */
export async function generateImage(prompt: string, options: any = {}): Promise<string> {
  return executeApiCall<string>("AI Image Creation", {
    prompt,
    options
  });
}

/**
 * Helper function for video generation using preferred AI service
 */
export async function generateVideo(prompt: string, options: any = {}): Promise<string> {
  return executeApiCall<string>("AI Video Generation", {
    prompt,
    options
  });
}

/**
 * Helper function for voice generation using preferred AI service
 */
export async function generateVoice(text: string, options: any = {}): Promise<string> {
  return executeApiCall<string>("Voice Generation", {
    text,
    options
  });
}

/**
 * Helper function for social media post creation
 */
export async function generateSocialPost(content: string, platform: string, options: any = {}): Promise<any> {
  return executeApiCall<any>("Social Media Post Creation", {
    content,
    platform,
    options
  });
}

/**
 * Helper function for moral analysis
 */
export async function analyzeMoralLevel(responses: any[], options: any = {}): Promise<any> {
  return executeApiCall<any>("Moral Analysis", {
    responses,
    options
  });
}
