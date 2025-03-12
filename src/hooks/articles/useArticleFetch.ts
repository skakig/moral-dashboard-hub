
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/articles";
import { handleError, processSupabaseError, ErrorType, ErrorDetails } from "@/utils/errorHandling";

/**
 * Hook for fetching articles with filtering capabilities
 */
export function useArticleFetch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastError, setLastError] = useState<ErrorDetails | null>(null);

  // Fetch articles from Supabase
  const { data: articles, isLoading, error, refetch } = useQuery({
    queryKey: ['articles', searchTerm, statusFilter],
    queryFn: async () => {
      // Log the fetch attempt for debugging
      console.log("Fetching articles with filters:", { searchTerm, statusFilter });
      
      try {
        // Instead of counting all articles, let's just get a paginated result set directly
        // Select only the essential columns for the list view to reduce data transfer
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

        // Order by most recent first (updated_at to prioritize recently edited)
        query = query.order('updated_at', { ascending: false });
        
        // Apply a smaller limit to prevent timeouts
        query = query.limit(10);

        console.log("Executing optimized query for articles");
        
        // Execute the query with a shorter timeout - we'll retry if needed
        const { data, error: dataError } = await Promise.race([
          query,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
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
        // Use our error handling system
        const errorDetails = processSupabaseError(error);
        setLastError(errorDetails);
        console.error("Error in article fetch:", errorDetails.message);
        throw errorDetails;
      }
    },
    staleTime: 1000, // Shorter stale time (1 second) to refresh more frequently
    retry: 1, // Reduce retry attempts to avoid excessive retries on timeout
    meta: {
      onError: (error: Error) => {
        // Use our error handling system
        handleError(error, { 
          component: 'useArticleFetch', 
          filters: { searchTerm, statusFilter } 
        });
      }
    }
  });

  return {
    articles: articles || [],
    isLoading,
    error,
    lastError,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    refetch,
  };
}
