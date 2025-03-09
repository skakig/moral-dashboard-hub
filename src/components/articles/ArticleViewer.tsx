
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/articles";
import { Loader2, ArrowLeft, Volume2, Download, Calendar, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export function ArticleViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error("Article not found");
        
        setArticle(data);
        
        // Create audio reference if voice_url exists
        if (data.voice_url) {
          const audio = new Audio(data.voice_url);
          audio.onended = () => setIsPlaying(false);
          setAudioRef(audio);
        }
        
      } catch (err: any) {
        console.error("Error fetching article:", err);
        setError(err.message);
        toast.error("Failed to load article");
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
    
    // Cleanup audio on unmount
    return () => {
      if (audioRef) {
        audioRef.pause();
        setAudioRef(null);
      }
    };
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const toggleAudio = () => {
    if (!audioRef) return;
    
    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleDownload = async () => {
    if (!article) return;

    try {
      toast.info('Preparing content for download...');
      
      const zip = new JSZip();
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${article.title}</title>
          <meta name="description" content="${article.meta_description || ''}">
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            img { max-width: 100%; height: auto; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>${article.title}</h1>
          ${article.content}
        </body>
        </html>
      `;
      zip.file(`${article.title}.html`, htmlContent);
      
      zip.file(`${article.title}.txt`, `${article.title}\n\n${article.content.replace(/<[^>]*>/g, '')}`);
      
      if (article.featured_image) {
        try {
          const imgResponse = await fetch(article.featured_image);
          const imgBlob = await imgResponse.blob();
          zip.file(`images/featured-image.${imgBlob.type.split('/')[1] || 'jpg'}`, imgBlob);
        } catch (imgError) {
          console.error('Error fetching featured image:', imgError);
        }
      }
      
      if (article.voice_url) {
        try {
          const audioResponse = await fetch(article.voice_url);
          const audioBlob = await audioResponse.blob();
          zip.file(`audio/${article.voice_file_name || 'voice-content.mp3'}`, audioBlob);
        } catch (audioError) {
          console.error('Error fetching voice content:', audioError);
        }
      }
      
      const metadata = {
        title: article.title,
        description: article.meta_description,
        keywords: article.seo_keywords,
        platform: article.category,
        moralLevel: article.moral_level,
        createdAt: article.created_at,
        status: article.status
      };
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));
      
      const content = await zip.generateAsync({ type: 'blob' });
      
      saveAs(content, `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_content.zip`);
      
      toast.success('Content downloaded successfully');
    } catch (error) {
      console.error('Error downloading article content:', error);
      toast.error('Failed to download content');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <h2 className="text-2xl font-bold mb-4">Error Loading Article</h2>
        <p className="text-muted-foreground mb-6">{error || "Article not found"}</p>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Button onClick={handleBack} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Button>
      </div>
      
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4">{article.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{article.category}</Badge>
            {article.moral_level && (
              <Badge variant="secondary">Moral Level: {article.moral_level}</Badge>
            )}
            {article.status && (
              <Badge>{article.status}</Badge>
            )}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            {article.publish_date ? formatDate(article.publish_date) : formatDate(article.created_at)}
          </div>
        </div>
        
        {article.featured_image && !article.featured_image.startsWith('data:') && (
          <div className="aspect-video overflow-hidden rounded-lg">
            <img 
              src={article.featured_image} 
              alt={article.title}
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {article.voice_url && (
            <Button onClick={toggleAudio} variant="outline" size="sm">
              <Volume2 className="mr-2 h-4 w-4" />
              {isPlaying ? "Pause Audio" : "Play Audio"}
            </Button>
          )}
          
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Content
          </Button>
          
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
        
        <Separator />
        
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-stone dark:prose-invert max-w-none"
                 dangerouslySetInnerHTML={{ __html: article.content }} />
          </CardContent>
        </Card>
        
        {article.seo_keywords && article.seo_keywords.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {article.seo_keywords.map((keyword, index) => (
                <Badge key={index} variant="outline">{keyword}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
