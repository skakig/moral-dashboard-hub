
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  // Generate article using AI
  const generateArticle = async (params: GenerateArticleParams) => {
    try {
      toast.info(`Generating content for ${params.contentType}...`);
      
      const response = await supabase.functions.invoke('generate-article', {
        body: params,
      });

      if (response.error) {
        console.error("Error response from generate-article function:", response.error);
        toast.error("Failed to generate article");
        return null;
      }

      toast.success("Content generated successfully");
      return response.data;
    } catch (error) {
      console.error("Error generating article:", error);
      toast.error("Failed to generate article");
      return null;
    }
  };

  return {
    generateArticle,
  };
}
