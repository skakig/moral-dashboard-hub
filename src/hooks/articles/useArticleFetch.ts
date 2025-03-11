
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
  const { data: articles, isLoading, error, refetch } = useQuery({
    queryKey: ['articles', searchTerm, statusFilter],
    queryFn: async () => {
      // Log the fetch attempt for debugging
      console.log("Fetching articles with filters:", { searchTerm, statusFilter });
      
      try {
        let query = supabase
          .from('articles')
          .select('id, title, content, category, status, seo_keywords, meta_description, featured_image, publish_date, created_at, updated_at, view_count, engagement_score, voice_url, voice_generated, voice_file_name, moral_level');

        // Apply search filter if provided
        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
        }

        // Apply status filter if provided
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Add limit to prevent timeouts 
        query = query.order('created_at', { ascending: false }).limit(50);

        // Fetch results
        const { data, error } = await query;

        if (error) {
          console.error("Error fetching articles:", error);
          throw error;
        }

        // Log the number of articles retrieved
        console.log(`Retrieved ${data?.length || 0} articles from Supabase`);
        
        return data as Article[];
      } catch (error: any) {
        console.error("Error in article fetch:", error.message || error);
        // Re-throw to let React Query handle retry
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds before refetching
    retry: 2, // Retry failed requests 2 times
    meta: {
      onError: (error: Error) => {
        console.error("Error in articles query:", error);
        toast.error("Failed to load articles: " + error.message);
      }
    }
  });

  return {
    articles: articles || [],
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    refetch,
  };
}
