
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
        // We need all fields for proper display
        let query = supabase
          .from('articles')
          .select('*'); // Get all fields to ensure we have complete article data

        // Apply search filter if provided
        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        // Apply status filter if provided
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Order by most recent first
        query = query.order('updated_at', { ascending: false });
        
        // Apply limit to prevent timeouts
        query = query.limit(10);

        console.log("Executing full article query");
        
        // Execute the query with a reasonable timeout
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

        // Log the number of articles retrieved and check for content/voice data
        console.log(`Successfully retrieved ${data?.length || 0} articles from Supabase`);
        
        if (data && data.length > 0) {
          // Sample log of first article
          const sampleArticle = data[0];
          console.log("Sample article data:", {
            id: sampleArticle.id,
            title: sampleArticle.title,
            hasContent: Boolean(sampleArticle.content),
            contentLength: sampleArticle.content?.length || 0,
            contentSample: sampleArticle.content?.substring(0, 50),
            hasVoiceData: Boolean(sampleArticle.voice_url),
            hasVoiceGenerated: sampleArticle.voice_generated
          });
        } else {
          console.log('No articles found');
        }
        
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
