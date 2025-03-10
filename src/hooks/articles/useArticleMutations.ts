
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArticleFormValues } from "@/components/articles/form";
import { mapFormToDbArticle } from "./utils/articleMappers";
import { useUser } from "@/hooks/useUser";

/**
 * Hook for article CRUD operations
 */
export function useArticleMutations() {
  const queryClient = useQueryClient();
  const { user } = useUser();

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
      
      const { data, error } = await supabase
        .from('articles')
        .insert(dbArticle)
        .select()
        .single();

      if (error) {
        console.error("Error creating article:", error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success("Article created successfully");
    },
    onError: (error) => {
      console.error("Error creating article:", error);
      toast.error(`Failed to create article: ${error instanceof Error ? error.message : "Unknown error"}`);
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
      
      const { data, error } = await supabase
        .from('articles')
        .update(dbArticle)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating article:", error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success("Article updated successfully");
    },
    onError: (error) => {
      console.error("Error updating article:", error);
      toast.error(`Failed to update article: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });

  // Delete article
  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success("Article deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting article:", error);
      toast.error(`Failed to delete article: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });

  return {
    createArticle,
    updateArticle,
    deleteArticle,
  };
}
