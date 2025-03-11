
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

      // Fetch results
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching articles:", error);
        throw error;
      }

      // Log the number of articles retrieved
      console.log(`Retrieved ${data?.length || 0} articles from Supabase`);
      
      return data as Article[];
    },
    staleTime: 30000, // 30 seconds before refetching
    retry: 2, // Retry failed requests 2 times
    onError: (error) => {
      console.error("Error in articles query:", error);
      toast.error("Failed to load articles");
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
