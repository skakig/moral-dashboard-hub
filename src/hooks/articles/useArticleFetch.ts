
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
        // First, get just the IDs to determine the total count - this avoids timeouts on large datasets
        let countQuery = supabase
          .from('articles')
          .select('id', { count: 'exact' });
        
        // Apply search filter if provided
        if (searchTerm) {
          countQuery = countQuery.ilike('title', `%${searchTerm}%`);
        }

        // Apply status filter if provided
        if (statusFilter !== 'all') {
          countQuery = countQuery.eq('status', statusFilter);
        }
        
        const { count, error: countError } = await countQuery;
        
        if (countError) {
          console.error("Error counting articles:", countError);
          throw countError;
        }
        
        console.log(`Total matching articles count: ${count || 0}`);
        
        // Now fetch a smaller set of articles with all necessary data
        // Select only the essential columns
        const essentialColumns = [
          'id', 'title', 'category', 'status', 
          'featured_image', 'publish_date', 'created_at', 
          'updated_at', 'view_count', 'voice_generated'
        ].join(',');

        let dataQuery = supabase
          .from('articles')
          .select(essentialColumns);

        // Apply search filter if provided
        if (searchTerm) {
          dataQuery = dataQuery.ilike('title', `%${searchTerm}%`);
        }

        // Apply status filter if provided
        if (statusFilter !== 'all') {
          dataQuery = dataQuery.eq('status', statusFilter);
        }

        // Order by most recent first (updated_at to prioritize recently edited)
        dataQuery = dataQuery.order('updated_at', { ascending: false });
        
        // Apply a reasonable limit to prevent timeouts
        dataQuery = dataQuery.limit(20); // Increased from 10 to show more recent articles

        // Execute the query with a timeout
        const { data, error: dataError } = await Promise.race([
          dataQuery,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout - trying to fetch too much data')), 8000)
          )
        ]) as any;

        if (dataError) {
          console.error("Error fetching articles:", dataError);
          throw dataError;
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
    staleTime: 10000, // 10 seconds before refetching (reduced from 30)
    retry: 1, // Reduced retries to prevent excessive attempts on timeout
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
