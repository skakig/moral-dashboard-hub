
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
  
  // Generate article using AI
  const generateArticle = async (params: GenerateArticleParams) => {
    try {
      setLoading(true);
      toast.info(`Generating content for ${params.contentType}...`);
      
      const response = await EdgeFunctionService.generateArticle(params);
      
      if (!response) {
        toast.error("Failed to generate content. Please try again.");
        return null;
      }

      toast.success("Content generated successfully");
      return response;
    } catch (error) {
      console.error("Error generating article:", error);
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
      // The error is already handled by the service
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateArticle,
    loading
  };
}
