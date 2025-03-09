
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArticleUpdateInput, Article } from "@/types/articles";

export function useArticleMutations() {
  const queryClient = useQueryClient();
  
  // Create a new article
  const createArticle = useMutation({
    mutationFn: async (article: Partial<ArticleUpdateInput> & { category?: string }) => {
      // Prepare the data for the database
      const { id, ...articleData } = article;
      
      // Set a default category if not provided
      const formattedData = {
        ...articleData,
        category: articleData.category || 'general', // Default category
        content: articleData.content || '', // Ensure content is never undefined/null
        // Any necessary transformations
      };
      
      const { data, error } = await supabase
        .from('articles')
        .insert(formattedData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success("Article created successfully");
    },
    onError: (error) => {
      console.error("Error creating article:", error);
      toast.error("Failed to create article");
    }
  });
  
  // Update an existing article
  const updateArticle = useMutation({
    mutationFn: async (article: ArticleUpdateInput) => {
      const { id, ...updateData } = article;
      
      // Handle status update if needed
      let status_update = {};
      if (article.meta_description?.includes("published")) {
        status_update = {
          status: "published",
          publish_date: new Date().toISOString()
        };
      }
      
      const { data, error } = await supabase
        .from('articles')
        .update({ ...updateData, ...status_update })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success("Article updated successfully");
    },
    onError: (error) => {
      console.error("Error updating article:", error);
      toast.error("Failed to update article");
    }
  });
  
  // Delete an article
  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success("Article deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    }
  });

  return {
    createArticle,
    updateArticle,
    deleteArticle
  };
}
