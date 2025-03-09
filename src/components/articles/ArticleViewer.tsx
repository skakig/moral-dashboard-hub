
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Article } from '@/types/articles';
import { toast } from 'sonner';
import { 
  ArticleHeader, 
  ArticleContent, 
  ArticleSkeleton, 
  ArticleNotFound 
} from './viewer';

export function ArticleViewer() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        if (!id) {
          throw new Error('Article ID is required');
        }
        
        setLoading(true);
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        // Ensure the status field conforms to the expected type
        const validStatus = ['draft', 'scheduled', 'published'].includes(data.status) 
          ? data.status as "draft" | "scheduled" | "published" 
          : "draft";
        
        // Create a valid Article object
        const articleData: Article = {
          ...data,
          status: validStatus,
          seo_keywords: Array.isArray(data.seo_keywords) ? data.seo_keywords : []
        };
        
        setArticle(articleData);
      } catch (error) {
        console.error('Error fetching article:', error);
        toast.error('Failed to load article');
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticle();
  }, [id]);

  if (loading) {
    return <ArticleSkeleton />;
  }

  if (!article) {
    return <ArticleNotFound />;
  }

  return (
    <div className="container py-8">
      <ArticleHeader 
        title={article.title} 
        createdAt={article.created_at}
        authorId={article.author_id}
        category={article.category}
      />
      
      <Card>
        <CardContent className="space-y-6 pt-6">
          <ArticleContent 
            content={article.content}
            excerpt={article.excerpt}
            voiceUrl={article.voice_url}
            keywords={article.seo_keywords}
          />
        </CardContent>
      </Card>
    </div>
  );
}
