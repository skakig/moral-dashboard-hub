
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArticleUpdateInput, Article } from "@/types/articles";

export function useArticleMutations() {
  const queryClient = useQueryClient();
  
  // Helper function to normalize values and ensure type compatibility
  const normalizeArticleData = (articleData: any) => {
    // Normalize moral level to a number
    const moralLevel = articleData.moral_level || articleData.moralLevel;
    const parsedMoralLevel = typeof moralLevel === 'string' 
      ? parseInt(moralLevel, 10) 
      : (moralLevel || 5);
    
    // Convert keywords from string to array if needed
    let seoKeywords = articleData.seo_keywords || articleData.seoKeywords || [];
    if (typeof seoKeywords === 'string') {
      seoKeywords = seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    }
    
    // Format the data for database
    return {
      content: articleData.content || '', // Ensure content is never undefined/null
      title: articleData.title || 'Untitled', // Ensure title is never undefined/null
      moral_level: parsedMoralLevel,
      seo_keywords: seoKeywords,
      meta_description: articleData.meta_description || articleData.metaDescription || '',
      featured_image: articleData.featured_image || articleData.featuredImage || '',
      voice_url: articleData.voice_url || articleData.voiceUrl || '',
      voice_generated: articleData.voice_generated || articleData.voiceGenerated || false,
      voice_file_name: articleData.voice_file_name || articleData.voiceFileName || '',
      voice_base64: articleData.voice_base64 || articleData.voiceBase64 || '',
      voice_segments: articleData.voice_segments || articleData.voiceSegments || '',
      category: articleData.category || 'general',
      status: articleData.status || 'draft',
      excerpt: articleData.excerpt || '',
      publish_date: articleData.publish_date || null
    };
  };
  
  // Create a new article
  const createArticle = useMutation({
    mutationFn: async (article: Partial<ArticleUpdateInput> & { category?: string }) => {
      // Prepare the data for the database
      const { id, ...articleData } = article;
      
      // Format the data for database
      const formattedData = normalizeArticleData(articleData);
      
      console.log("Creating article with data:", formattedData);
      
      const { data, error } = await supabase
        .from('articles')
        .insert(formattedData)
        .select()
        .single();
      
      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
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
    }
  });
  
  // Update an existing article
  const updateArticle = useMutation({
    mutationFn: async (article: ArticleUpdateInput) => {
      const { id, ...updateData } = article;
      
      // Format the data for database
      const formattedData = normalizeArticleData(updateData);
      
      // Handle status update if needed
      if (updateData.status) {
        formattedData.status = updateData.status;
        if (updateData.status === 'published' && !formattedData.publish_date) {
          formattedData.publish_date = new Date().toISOString();
        }
      }
      
      console.log("Updating article with ID:", id, "Data:", formattedData);
      
      const { data, error } = await supabase
        .from('articles')
        .update(formattedData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Supabase update error:", error);
        throw error;
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
