
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/articles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Pause, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useActivityTracking } from "@/hooks/useActivityTracking";

export function ArticleViewer() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  
  // When component loads, fetch the article data
  useEffect(() => {
    async function fetchArticle() {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // Type assertion to ensure it matches the Article type
        setArticle(data as Article);
        
        // Create audio player if there's a voice URL
        if (data.voice_url) {
          const player = new Audio(data.voice_url);
          player.addEventListener('ended', () => setAudioPlaying(false));
          setAudioPlayer(player);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        toast.error('Failed to load article');
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticle();
    
    // Cleanup
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.removeEventListener('ended', () => setAudioPlaying(false));
      }
    };
  }, [id]);
  
  // Play/pause audio
  const toggleAudio = () => {
    if (!audioPlayer) return;
    
    if (audioPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play().catch(error => {
        console.error('Error playing audio:', error);
        toast.error('Failed to play audio');
      });
    }
    
    setAudioPlaying(!audioPlaying);
  };
  
  // Download content
  const downloadText = () => {
    if (!article) return;
    
    const blob = new Blob([article.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${article.title || 'article'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-2 mt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }
  
  if (!article) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Article not found</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{article.title}</CardTitle>
          <CardDescription>
            {article.meta_description || 'No description available'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            {article.voice_url && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleAudio}
                className="flex items-center space-x-2"
              >
                {audioPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{audioPlaying ? 'Pause Audio' : 'Play Audio'}</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadText}
              className="flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Download Text</span>
            </Button>
          </div>
          
          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">
                <FileText size={16} className="mr-2" />
                Content
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4">
              <div className="prose dark:prose-invert max-w-none">
                {article.content.split('\n').map((paragraph, idx) => (
                  paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {article.featured_image && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={article.featured_image} 
              alt={article.title} 
              className="w-full h-auto max-h-96 object-contain rounded-md"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
