
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/articles";

export function useArticles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch articles from Supabase
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['articles', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select('*');

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      // Apply status filter if provided
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching articles:", error);
        toast.error("Failed to load articles");
        return [];
      }

      return data as Article[];
    },
  });

  // Create new article
  const createArticle = useMutation({
    mutationFn: async (article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'engagement_score'>) => {
      const { data, error } = await supabase
        .from('articles')
        .insert(article)
        .select()
        .single();

      if (error) {
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
      toast.error("Failed to create article");
    },
  });

  // Update existing article
  const updateArticle = useMutation({
    mutationFn: async ({ id, ...article }: Partial<Article> & { id: string }) => {
      const { data, error } = await supabase
        .from('articles')
        .update(article)
        .eq('id', id)
        .select()
        .single();

      if (error) {
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
      toast.error("Failed to update article");
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
      toast.error("Failed to delete article");
    },
  });

  // Generate article using AI
  const generateArticle = async (params: {
    theme: string;
    keywords: string[];
    contentType: string;
    moralLevel: number;
  }) => {
    try {
      const response = await supabase.functions.invoke('generate-article', {
        body: params,
      });

      if (response.error) {
        toast.error("Failed to generate article");
        return null;
      }

      return response.data;
    } catch (error) {
      console.error("Error generating article:", error);
      toast.error("Failed to generate article");
      return null;
    }
  };

  return {
    articles,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    createArticle,
    updateArticle,
    deleteArticle,
    generateArticle,
  };
}
