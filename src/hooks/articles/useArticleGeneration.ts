
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useArticleGeneration() {
  // Generate article mutation
  const generateArticle = useMutation({
    mutationFn: async (input: {
      title?: string;
      theme?: string;
      contentType?: string;
      platform?: string;
      contentLength?: string;
      tone?: string;
      keywords?: string;
      moralLevel?: number;
    }) => {
      try {
        // Call the edge function or directly generate an article draft
        const { data, error } = await supabase.functions.invoke('generate-article', {
          body: input
        });
        
        if (error) throw error;
        
        if (!data) {
          throw new Error('No data returned from article generation');
        }
        
        // If successful, create a new article with the generated content
        const { data: article, error: insertError } = await supabase
          .from('articles')
          .insert({
            title: input.title || data.title || 'Untitled Article',
            content: data.content || '',
            meta_description: data.meta_description || '',
            seo_keywords: data.keywords ? data.keywords.split(',').map((k: string) => k.trim()) : [],
            category: input.platform || 'general',
            status: 'draft'
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return article;
      } catch (error) {
        console.error("Error generating article:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Article generated successfully");
    },
    onError: (error) => {
      console.error("Error generating article:", error);
      toast.error("Failed to generate article");
    }
  });
  
  return {
    generateArticle
  };
}
