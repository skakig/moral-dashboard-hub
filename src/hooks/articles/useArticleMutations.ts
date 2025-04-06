
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
      try {
        const dbArticle = mapFormToDbArticle(article);
        
        // Log what we're sending to Supabase
        console.log("Creating article:", {
          title: dbArticle.title,
          hasContent: Boolean(dbArticle.content),
          hasVoiceData: Boolean(dbArticle.voice_url),
          contentLength: dbArticle.content?.length || 0,
          voiceDataSize: dbArticle.voice_base64 ? Math.round(dbArticle.voice_base64.length / 1024) + 'KB' : 'none'
        });
        
        // Check for large voice_base64 data
        const hasLargeVoiceData = dbArticle.voice_base64 && dbArticle.voice_base64.length > 100000;
        
        if (hasLargeVoiceData) {
          console.log("Detected large voice data, using two-step approach");
          
          // Step 1: Create article without voice data
          const voiceData = dbArticle.voice_base64;
          const articleWithoutVoice = { ...dbArticle, voice_base64: null };
          
          const { data: articleData, error } = await supabase
            .from('articles')
            .insert(articleWithoutVoice)
            .select('id, title')
            .single();

          if (error) {
            console.error("Error creating article:", error);
            throw new Error(`Failed to create article: ${error.message}`);
          }
          
          const data = articleData;
          
          // Step 2: Update with voice data separately if needed
          if (data && voiceData) {
            console.log(`Article created (ID: ${data.id}), now adding voice data separately`);
            
            try {
              const { error: updateError } = await supabase
                .from('articles')
                .update({ voice_base64: voiceData })
                .eq('id', data.id);
                
              if (updateError) {
                console.error("Error updating voice data:", updateError);
                toast.warning("Article created but voice data couldn't be saved fully");
              } else {
                console.log("Voice data added successfully");
              }
            } catch (err) {
              console.error("Error in voice data update:", err);
              toast.warning("Article created but voice data couldn't be saved fully");
            }
          }
          
          return data;
        } else {
          // Standard approach for normal-sized articles
          console.log("Using standard approach for article creation");
          const { data, error } = await supabase
            .from('articles')
            .insert(dbArticle)
            .select('id, title')
            .single();

          if (error) {
            console.error("Error creating article:", error);
            throw new Error(`Failed to create article: ${error.message}`);
          }
          
          console.log("Article created successfully:", data);
          return data;
        }
      } catch (error) {
        console.error("Error in createArticle mutation:", error);
        throw error; // Re-throw to be handled by the mutation error handler
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
      try {
        const dbArticle = mapFormToDbArticle(formValues as ArticleFormValues);
        
        // Check for large voice_base64 data
        const hasLargeVoiceData = dbArticle.voice_base64 && dbArticle.voice_base64.length > 100000;
        
        if (hasLargeVoiceData) {
          console.log("Detected large voice data, using two-step approach for update");
          
          // Step 1: Update without the large voice data
          const voiceBase64 = dbArticle.voice_base64;
          const articleWithoutVoiceData = { ...dbArticle, voice_base64: null };
          
          const { data: articleData, error } = await supabase
            .from('articles')
            .update(articleWithoutVoiceData)
            .eq('id', id)
            .select('id, title')
            .single();

          if (error) {
            console.error("Error updating article:", error);
            throw new Error(`Failed to update article: ${error.message}`);
          }
          
          const data = articleData;
          
          // Step 2: Update voice_base64 field separately
          if (data && voiceBase64) {
            console.log(`Article updated (ID: ${data.id}), now updating voice data separately`);
            
            try {
              const { error: updateError } = await supabase
                .from('articles')
                .update({ voice_base64: voiceBase64 })
                .eq('id', id);
                
              if (updateError) {
                console.error("Error updating voice data:", updateError);
                toast.warning("Article updated but voice data couldn't be saved fully");
              } else {
                console.log("Voice data updated successfully");
              }
            } catch (err) {
              console.error("Error in voice data update:", err);
              toast.warning("Article updated but voice data couldn't be saved fully");
            }
          }
          
          return data;
        } else {
          // Standard approach for normal-sized articles
          console.log("Using standard approach for article update");
          const { data, error } = await supabase
            .from('articles')
            .update(dbArticle)
            .eq('id', id)
            .select('id, title')
            .single();

          if (error) {
            console.error("Error updating article:", error);
            throw new Error(`Failed to update article: ${error.message}`);
          }
          
          console.log("Article updated successfully:", data);
          return data;
        }
      } catch (error) {
        console.error("Error in updateArticle mutation:", error);
        throw error;
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
        console.error("Error deleting article:", error);
        throw new Error(`Failed to delete article: ${error.message}`);
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
