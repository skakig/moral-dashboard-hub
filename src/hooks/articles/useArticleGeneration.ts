
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
      
      // Use the existing generateContent function
      const response = await EdgeFunctionService.generateContent({
        prompt: params.theme,
        content_type: params.contentType,
        moral_level: params.moralLevel,
        platform: params.platform,
        length: params.contentLength,
        tone: params.tone,
        keywords: params.keywords
      });
      
      if (!response) {
        return null;
      }

      toast.success("Content generated successfully");
      return response;
    } catch (error) {
      console.error("Error generating article:", error);
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
