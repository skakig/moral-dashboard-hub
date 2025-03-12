
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/articles";
import { handleError, processSupabaseError, ErrorType, ErrorDetails } from "@/utils/errorHandling";

/**
 * Hook for fetching articles with filtering and pagination capabilities
 */
export function useArticleFetch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastError, setLastError] = useState<ErrorDetails | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Reduced page size to prevent timeouts

  // Fetch articles from Supabase with pagination and optimized query
  const { data: articles, isLoading, error, refetch } = useQuery({
    queryKey: ['articles', searchTerm, statusFilter, page, pageSize],
    queryFn: async () => {
      // Log the fetch attempt for debugging
      console.log("Fetching articles with filters:", { searchTerm, statusFilter, page, pageSize });
      
      try {
        // We need selected fields but not all content (which can be large)
        let query = supabase
          .from('articles')
          .select('id, title, status, created_at, updated_at, publish_date, category, featured_image, engagement_score, view_count, meta_description, seo_keywords');

        // Apply search filter if provided
        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        // Apply status filter if provided
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Apply pagination with smaller page size
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        // Order by most recent first
        query = query.order('updated_at', { ascending: false });
        
        console.log("Executing optimized article query with pagination");
        
        // Execute the query with a reasonable timeout
        const { data, error: dataError, count } = await Promise.race([
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
        console.log(`Successfully retrieved ${data?.length || 0} articles from Supabase (paginated)`);
        
        if (data && data.length > 0) {
          // Sample log of first article
          const sampleArticle = data[0];
          console.log("Sample article data:", {
            id: sampleArticle.id,
            title: sampleArticle.title,
            status: sampleArticle.status,
            category: sampleArticle.category,
          });
        } else {
          console.log('No articles found for the current page/filters');
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
          filters: { searchTerm, statusFilter, page, pageSize } 
        });
      }
    }
  });

  // Function to fetch a single article with complete data
  const fetchArticleById = async (id: string): Promise<Article | null> => {
    try {
      console.log(`Fetching complete article data for ID: ${id}`);
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')  // Select all fields for single article view
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Make sure status is one of the valid types
        const validatedData: Article = {
          ...data,
          status: (data.status as "draft" | "scheduled" | "published") || "draft"
        };
        
        console.log("Fetched complete article:", {
          id: validatedData.id,
          title: validatedData.title,
          hasContent: Boolean(validatedData.content),
          contentLength: validatedData.content?.length || 0,
          hasVoiceUrl: Boolean(validatedData.voice_url)
        });
        
        return validatedData;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching single article:", error);
      handleError(error, { 
        component: 'useArticleFetch.fetchArticleById', 
        articleId: id 
      });
      return null;
    }
  };

  return {
    articles: articles || [],
    isLoading,
    error,
    lastError,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    refetch,
    fetchArticleById,  // Add the single article fetch function
  };
}
