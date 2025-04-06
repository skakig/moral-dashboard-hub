
import { useState } from "react";
import { toast } from "sonner";
import { EdgeFunctionService } from "@/services/api/edgeFunctions";

interface GenerateArticleParams {
  theme: string;
  keywords: string[];
  contentType: string;
  moralLevel: number;
  platform?: string;
  contentLength?: string;
  tone?: string;
}

/**
 * Hook for AI article generation
 */
export function useArticleGeneration() {
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  
  // Generate article using AI
  const generateArticle = async (params: GenerateArticleParams) => {
    try {
      setLoading(true);
      toast.info(`Generating content for ${params.contentType}...`);
      
      // Validate required parameters
      if (!params.theme) {
        toast.error("Theme is required for content generation");
        return null;
      }
      
      if (!params.contentType) {
        toast.error("Content type is required for generation");
        return null;
      }

      let attempts = 0;
      let lastError = null;
      
      // Implement retry logic
      while (attempts <= retryCount) {
        try {
          attempts++;
          
          if (attempts > 1) {
            toast.info(`Retry attempt ${attempts} of ${retryCount + 1}`);
          }
          
          const response = await EdgeFunctionService.generateArticle(params);
          
          if (response) {
            toast.success("Content generated successfully");
            // Reset retry count on success
            setRetryCount(0);
            return response;
          } else {
            throw new Error("Failed to generate content. Empty response received.");
          }
        } catch (error) {
          console.error(`Error generating article (Attempt ${attempts}/${retryCount + 1}):`, error);
          lastError = error;
          
          if (attempts <= retryCount) {
            // Wait before retrying (increasing delay with each retry)
            await new Promise(resolve => setTimeout(resolve, attempts * 1000));
          } else {
            // On final attempt, throw the error to be caught by the outer catch
            throw error;
          }
        }
      }
      
      // This should never be reached, but just in case
      throw lastError || new Error("Failed to generate content after retries");
    } catch (error) {
      console.error("Error generating article:", error);
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
      
      // Increase retry count for next attempt, up to max retries
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prevCount => prevCount + 1);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateArticle,
    loading,
    retryCount
  };
}
