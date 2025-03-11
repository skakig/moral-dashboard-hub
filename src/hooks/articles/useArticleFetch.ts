
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
        // Select only the essential columns initially to reduce payload size and query time
        // This is crucial for preventing timeouts
        const essentialColumns = [
          'id', 'title', 'category', 'status', 
          'featured_image', 'publish_date', 'created_at', 
          'updated_at', 'view_count', 'voice_generated'
        ].join(',');

        let query = supabase
          .from('articles')
          .select(essentialColumns);

        // Apply search filter if provided
        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        // Apply status filter if provided
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Order by most recent first
        query = query.order('created_at', { ascending: false });
        
        // Strict limit to prevent timeouts - we'll paginate if needed later
        query = query.limit(20);

        // Execute the query with a timeout
        const { data, error } = await Promise.race([
          query,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 8000)
          )
        ]) as any;

        if (error) {
          console.error("Error fetching articles:", error);
          throw error;
        }

        // Log the number of articles retrieved
        console.log(`Successfully retrieved ${data?.length || 0} articles from Supabase`);
        
        return data as Article[];
      } catch (error: any) {
        console.error("Error in article fetch:", error.message || error);
        // Re-throw to let React Query handle retry
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds before refetching
    retry: 1, // Reduced retries to prevent excessive attempts on timeout
    meta: {
      // This is the proper way to handle errors in React Query v5+
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
