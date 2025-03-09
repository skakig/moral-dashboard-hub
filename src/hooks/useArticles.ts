
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/articles";
import { ArticleFormValues } from "@/components/articles/form";

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

  // Map form values to database fields
  const mapFormToDbArticle = (formValues: ArticleFormValues) => {
    // Extract keywords from comma-separated string
    const seoKeywords = formValues.seoKeywords 
      ? formValues.seoKeywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];
      
    // Map the form fields to database fields - only include fields that exist in the DB schema
    return {
      title: formValues.title,
      content: formValues.content || '',
      meta_description: formValues.metaDescription || null,
      featured_image: formValues.featuredImage || null,
      seo_keywords: seoKeywords,
      status: 'draft', // Default to draft
      category: formValues.platform || 'General', // Use platform as category
      voice_url: formValues.voiceUrl || null,
      voice_generated: formValues.voiceGenerated || false,
      voice_file_name: formValues.voiceFileName || null, 
      voice_base64: formValues.voiceBase64 || null,
      moral_level: formValues.moralLevel ? Number(formValues.moralLevel) : 5,
      excerpt: formValues.excerpt || null
    };
  };

  // Create new article
  const createArticle = useMutation({
    mutationFn: async (article: ArticleFormValues) => {
      const dbArticle = mapFormToDbArticle(article);
      
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
      toast.error("Failed to create article");
    },
  });

  // Update existing article
  const updateArticle = useMutation({
    mutationFn: async ({ id, ...formValues }: Partial<ArticleFormValues> & { id: string }) => {
      const dbArticle = mapFormToDbArticle(formValues as ArticleFormValues);
      
      const { data, error } = await supabase
        .from('articles')
        .update(dbArticle)
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
    platform?: string;
    contentLength?: string;
    tone?: string;
  }) => {
    try {
      const response = await supabase.functions.invoke('generate-article', {
        body: params,
      });

      if (response.error) {
        console.error("Error response from generate-article function:", response.error);
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
