
import { useState } from 'react';
import { useArticleMutations } from './useArticleMutations';
import { Article } from '@/types/articles';
import { toast } from 'sonner';

export interface ArticleVersion {
  id: string;
  articleId: string;
  version: number;
  content: string;
  title: string;
  meta_description?: string;
  featured_image?: string;
  voice_url?: string;
  created_at: string;
  user_id?: string;
}

/**
 * Hook for managing article version history
 */
export function useArticleVersions() {
  const [versions, setVersions] = useState<ArticleVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { updateArticle } = useArticleMutations();

  // Create a new version when saving an article
  const createVersion = async (article: Article) => {
    try {
      setIsLoading(true);
      // For now, we're using local state to store versions 
      // In a future implementation, this would save to a database table
      
      const newVersion: ArticleVersion = {
        id: `version-${Date.now()}`,
        articleId: article.id,
        version: versions.filter(v => v.articleId === article.id).length + 1,
        content: article.content,
        title: article.title,
        meta_description: article.meta_description,
        featured_image: article.featured_image,
        voice_url: article.voice_url,
        created_at: new Date().toISOString(),
      };
      
      setVersions(prev => [...prev, newVersion]);
      setCurrentVersion(article);
      return newVersion;
    } catch (error) {
      console.error('Error creating article version:', error);
      toast.error('Failed to create version');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Revert to a specific version
  const revertToVersion = async (version: ArticleVersion) => {
    try {
      setIsLoading(true);
      
      if (!version) {
        throw new Error('Invalid version specified');
      }
      
      // Apply the version data to the article
      await updateArticle.mutateAsync({
        id: version.articleId,
        title: version.title,
        content: version.content,
        metaDescription: version.meta_description,
        featuredImage: version.featured_image,
        voiceUrl: version.voice_url,
      });
      
      toast.success(`Reverted to version ${version.version}`);
      return true;
    } catch (error) {
      console.error('Error reverting to version:', error);
      toast.error('Failed to revert to selected version');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get versions for a specific article
  const getVersionsForArticle = (articleId: string) => {
    return versions.filter(v => v.articleId === articleId);
  };

  return {
    versions,
    createVersion,
    revertToVersion,
    getVersionsForArticle,
    isLoading,
    currentVersion
  };
}
