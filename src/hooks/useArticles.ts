
import { useArticleFetch } from "./articles/useArticleFetch";
import { useArticleMutations } from "./articles/useArticleMutations";
import { useArticleGeneration } from "./articles/useArticleGeneration";

/**
 * Main hook for article operations that composes more specialized hooks
 */
export function useArticles() {
  // Use the specialized hooks
  const { articles, isLoading, error, lastError, searchTerm, setSearchTerm, statusFilter, setStatusFilter, refetch } = 
    useArticleFetch();
  
  const { createArticle, updateArticle, deleteArticle } = useArticleMutations();
  
  const { generateArticle } = useArticleGeneration();
  
  // Return all the functionality combined
  return {
    // From useArticleFetch
    articles,
    isLoading,
    error,
    lastError, // Added to fix TypeScript error
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    refetch,
    
    // From useArticleMutations
    createArticle,
    updateArticle,
    deleteArticle,
    
    // From useArticleGeneration
    generateArticle,
  };
}
