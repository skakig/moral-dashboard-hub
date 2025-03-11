
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArticleFormValues } from "@/components/articles/form";
import { mapFormToDbArticle } from "./utils/articleMappers";

/**
 * Hook for article CRUD operations
 */
export function useArticleMutations() {
  const queryClient = useQueryClient();

  // Create new article
  const createArticle = useMutation({
    mutationFn: async (article: ArticleFormValues) => {
      const dbArticle = mapFormToDbArticle(article);
      
      // Log what we're sending to Supabase
      console.log("Creating article:", {
        title: dbArticle.title,
        hasContent: Boolean(dbArticle.content),
        hasVoiceData: Boolean(dbArticle.voice_url)
      });
      
      // Check for large voice_base64 data and handle it accordingly
      const hasLargeVoiceData = dbArticle.voice_base64 && dbArticle.voice_base64.length > 500000;
      
      if (hasLargeVoiceData) {
        console.log("Detected large voice data, using chunked approach");
        // For large voice data, we'll store it separately to avoid timeout issues
        const { data, error } = await supabase
          .from('articles')
          .insert({
            ...dbArticle,
            voice_base64: null, // Temporarily set to null
          })
          .select('id, title')
          .single();

        if (error) {
          console.error("Error creating article:", error);
          throw new Error(error.message);
        }
        
        // Now update the voice_base64 field separately
        if (data) {
          try {
            const { error: updateError } = await supabase
              .from('articles')
              .update({ voice_base64: dbArticle.voice_base64 })
              .eq('id', data.id);
              
            if (updateError) {
              console.error("Error updating voice data:", updateError);
              // We don't throw here as the article is created, just log the error
            }
          } catch (err) {
            console.error("Error in voice data update:", err);
          }
        }
        
        return data;
      } else {
        // For normal-sized articles, use standard approach
        const { data, error } = await supabase
          .from('articles')
          .insert(dbArticle)
          .select('id, title')
          .single();

        if (error) {
          console.error("Error creating article:", error);
          throw new Error(error.message);
        }

        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success(`Article "${data?.title || 'New article'}" created successfully`);
    },
    onError: (error: Error) => {
      console.error("Error creating article:", error);
      toast.error(`Failed to create article: ${error.message}`);
    },
  });

  // Update existing article
  const updateArticle = useMutation({
    mutationFn: async ({ id, ...formValues }: Partial<ArticleFormValues> & { id: string }) => {
      const dbArticle = mapFormToDbArticle(formValues as ArticleFormValues);
      
      // Log what we're updating in Supabase
      console.log("Updating article:", {
        id,
        title: dbArticle.title,
        hasVoiceData: Boolean(dbArticle.voice_url)
      });
      
      // Check for large voice_base64 data and handle it accordingly
      const hasLargeVoiceData = dbArticle.voice_base64 && dbArticle.voice_base64.length > 500000;
      
      if (hasLargeVoiceData) {
        console.log("Detected large voice data, using chunked approach for update");
        // For large voice data, we'll update it separately to avoid timeout issues
        const voiceBase64 = dbArticle.voice_base64;
        const articleWithoutVoiceData = { ...dbArticle, voice_base64: null };
        
        // First update without the large voice data
        const { data, error } = await supabase
          .from('articles')
          .update(articleWithoutVoiceData)
          .eq('id', id)
          .select('id, title')
          .single();

        if (error) {
          console.error("Error updating article:", error);
          throw new Error(error.message);
        }
        
        // Now update the voice_base64 field separately
        try {
          const { error: updateError } = await supabase
            .from('articles')
            .update({ voice_base64: voiceBase64 })
            .eq('id', id);
            
          if (updateError) {
            console.error("Error updating voice data:", updateError);
            // We don't throw here as the article is updated, just log the error
          }
        } catch (err) {
          console.error("Error in voice data update:", err);
        }
        
        return data;
      } else {
        // For normal-sized articles, use standard approach
        const { data, error } = await supabase
          .from('articles')
          .update(dbArticle)
          .eq('id', id)
          .select('id, title')
          .single();

        if (error) {
          console.error("Error updating article:", error);
          throw new Error(error.message);
        }

        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success(`Article "${data?.title || 'Article'}" updated successfully`);
    },
    onError: (error: Error) => {
      console.error("Error updating article:", error);
      toast.error(`Failed to update article: ${error.message}`);
    },
  });

  // Delete article
  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting article with ID:", id);
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success("Article deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Error deleting article:", error);
      toast.error(`Failed to delete article: ${error.message}`);
    },
  });

  return {
    createArticle,
    updateArticle,
    deleteArticle,
  };
}
