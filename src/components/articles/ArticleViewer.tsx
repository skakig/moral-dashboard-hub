
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Article } from '@/types/articles';
import { ChevronLeft, Calendar, User, Tag, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

export function ArticleViewer() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

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
          status: validStatus
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

  useEffect(() => {
    // Initialize audio player if there's a voice URL
    if (article?.voice_url) {
      const audioElement = new Audio(article.voice_url);
      setAudio(audioElement);
      
      // Clean up when component unmounts
      return () => {
        audioElement.pause();
        audioElement.src = '';
      };
    }
  }, [article?.voice_url]);

  const togglePlayPause = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse text-center">
            <div className="h-8 w-64 bg-muted rounded mb-4 mx-auto"></div>
            <div className="h-4 w-48 bg-muted rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for might have been removed or doesn't exist.
          </p>
          <Button asChild>
            <Link to="/articles">Return to Articles</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/articles">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-3xl">{article.title}</CardTitle>
            
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {formatDate(article.created_at)}
              </div>
              
              <div className="flex items-center">
                <User className="mr-1 h-4 w-4" />
                {article.author_id || 'Unknown'}
              </div>
              
              {article.category && (
                <div className="flex items-center">
                  <Tag className="mr-1 h-4 w-4" />
                  {article.category}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {article.excerpt && (
            <div>
              <p className="text-lg font-medium italic">{article.excerpt}</p>
              <Separator className="my-4" />
            </div>
          )}
          
          {article.voice_url && (
            <div className="flex items-center gap-2 p-4 bg-secondary/20 rounded-md">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={togglePlayPause}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {isPlaying ? 'Playing audio...' : 'Listen to this article'}
              </span>
            </div>
          )}
          
          <div className="prose dark:prose-invert max-w-none">
            {article.content?.split('\n').map((paragraph, index) => (
              paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
            ))}
          </div>
          
          {article.seo_keywords && article.seo_keywords.length > 0 && (
            <div className="pt-4">
              <h3 className="text-sm font-semibold mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(article.seo_keywords) ? article.seo_keywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-secondary/20 rounded text-sm"
                  >
                    {keyword}
                  </span>
                )) : null}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
