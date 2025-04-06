
import { useState } from "react";
import { toast } from "sonner";
import { EdgeFunctionService } from "@/services/api/edgeFunctions";

interface GenerateArticleParams {
  theme: string;
  keywords: string[] | string | undefined | null;
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

      // Prepare the parameters, ensuring keywords is properly handled
      const normalizedParams = {
        ...params,
        keywords: Array.isArray(params.keywords) 
          ? params.keywords 
          : (typeof params.keywords === 'string' && params.keywords 
              ? params.keywords.split(',').map(k => k.trim()) 
              : [])
      };
      
      console.log("Generating article with params:", {
        theme: normalizedParams.theme,
        contentType: normalizedParams.contentType,
        keywordCount: normalizedParams.keywords?.length || 0,
        moralLevel: normalizedParams.moralLevel
      });

      // Invoke the edge function with more resilient error handling
      const result = await EdgeFunctionService.generateArticle(normalizedParams);
      
      if (result) {
        toast.success("Content generated successfully");
        console.log("Article generation successful:", {
          hasTitle: Boolean(result.title),
          contentLength: result.content?.length || 0,
          hasMetaDescription: Boolean(result.metaDescription)
        });
        
        // Reset retry count on success
        setRetryCount(0);
        return result;
      } else {
        throw new Error("Failed to generate content. Empty response received.");
      }
    } catch (error: any) {
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
