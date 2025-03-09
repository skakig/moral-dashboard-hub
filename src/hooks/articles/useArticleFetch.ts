
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/articles";

/**
 * Hook for fetching articles with filtering capabilities
 */
export function useArticleFetch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch articles from Supabase
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['articles', searchTerm, statusFilter],
    queryFn: async () => {
      try {
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

        // Validate and format each article to ensure it matches our type
        const formattedArticles = data.map((article: any) => {
          // Ensure status is one of the expected values
          const validStatus = ["draft", "scheduled", "published"].includes(article.status)
            ? article.status
            : "draft";
            
          return {
            ...article,
            status: validStatus,
            // Ensure arrays are properly handled
            seo_keywords: Array.isArray(article.seo_keywords) ? article.seo_keywords : [],
          };
        });

        return formattedArticles as Article[];
      } catch (e) {
        console.error("Unexpected error fetching articles:", e);
        toast.error("Failed to load articles");
        return [];
      }
    },
  });

  return {
    articles,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
  };
}
