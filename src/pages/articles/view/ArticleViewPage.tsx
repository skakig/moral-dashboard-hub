
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, FileEdit, ArrowLeft, Calendar, CalendarClock, Eye, Volume, Play, Pause, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/articles";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { handleError } from "@/utils/errorHandling";
import { ErrorDisplay } from "@/components/ui/error-display";

export default function ArticleViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (fetchError) throw fetchError;
        
        if (data) {
          console.log("Fetched article data:", {
            id: data.id,
            title: data.title,
            hasContent: Boolean(data.content),
            contentLength: data.content?.length || 0,
            contentSample: data.content?.substring(0, 50),
            hasVoiceUrl: Boolean(data.voice_url),
            status: data.status
          });
          
          // Make sure status is one of the valid types
          const validatedData: Article = {
            ...data,
            status: (data.status as "draft" | "scheduled" | "published") || "draft"
          };
          
          setArticle(validatedData);
          
          // Update view count
          const { error: updateError } = await supabase
            .from('articles')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', id);
            
          if (updateError) {
            console.error("Error updating view count:", updateError);
          }
        } else {
          toast.error("Article not found");
          navigate("/articles");
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        const processedError = handleError(err, {
          component: 'ArticleViewPage',
          action: 'fetch-article',
          articleId: id
        });
        setError(processedError);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticle();
  }, [id, navigate]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            Draft
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <CalendarClock className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
        );
      case "published":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Eye className="mr-1 h-3 w-3" />
            Published
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const toggleAudioPlayback = () => {
    if (!article?.voice_url) {
      toast.error("No audio available");
      return;
    }
    
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        // Ensure the audio source is set correctly
        if (audioRef.current.src !== article.voice_url) {
          audioRef.current.src = article.voice_url;
        }
        
        audioRef.current.play().catch(error => {
          console.error("Audio playback error:", error);
          toast.error("Failed to play audio");
        });
        setIsAudioPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsAudioPlaying(false);
  };

  const handleAudioError = (e: any) => {
    console.error("Audio error:", e);
    toast.error("Error playing audio file");
    setIsAudioPlaying(false);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setAudioVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const downloadAudio = () => {
    if (!article?.voice_url) {
      toast.error("No audio available to download");
      return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = article.voice_url;
      a.download = article.voice_file_name || 'voice-content.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Audio file downloaded successfully');
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast.error('Failed to download audio file');
    }
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/articles")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <ErrorDisplay 
              error={error}
              title="Error loading article"
              onRetry={() => window.location.reload()}
            />
          ) : article ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                    <div>{getStatusBadge(article.status)}</div>
                    <div>Category: {article.category || "General"}</div>
                    <div>{article.created_at ? format(new Date(article.created_at), "MMM d, yyyy") : "N/A"}</div>
                    <div>Views: {article.view_count || 0}</div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate(`/articles/edit/${article.id}`)}
                  className="flex items-center gap-2"
                >
                  <FileEdit className="h-4 w-4" />
                  Edit Article
                </Button>
              </div>
              
              {article.featured_image && (
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <img 
                    src={article.featured_image} 
                    alt={article.title} 
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              
              {article.excerpt && (
                <div className="bg-muted p-4 rounded-md italic text-muted-foreground">
                  {article.excerpt}
                </div>
              )}
              
              {article.voice_url && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Audio Version</h3>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={toggleAudioPlayback}
                        className="flex items-center space-x-1"
                      >
                        {isAudioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        <span>{isAudioPlaying ? "Pause" : "Play"} Audio</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={downloadAudio}
                        className="flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {article.voice_file_name || "audio.mp3"}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Volume className="w-4 h-4 text-muted-foreground" />
                      <Slider
                        value={[audioVolume]} 
                        min={0} 
                        max={1} 
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="w-32" 
                      />
                    </div>
                    
                    <audio 
                      ref={audioRef}
                      src={article.voice_url} 
                      className="w-full" 
                      onEnded={handleAudioEnded}
                      onError={handleAudioError}
                      controls
                    />
                  </div>
                </div>
              )}
              
              <div className="prose prose-lg max-w-none">
                {article.content ? (
                  <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} />
                ) : (
                  <p className="text-muted-foreground py-6 text-center border border-dashed rounded-md">
                    No content available for this article.
                  </p>
                )}
              </div>
              
              {article.meta_description && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-md font-medium mb-2">SEO Description</h3>
                  <p className="text-muted-foreground">{article.meta_description}</p>
                </div>
              )}
              
              {article.seo_keywords && article.seo_keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.seo_keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">{keyword}</Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Article not found</p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/articles")} 
                className="mt-4"
              >
                Back to Articles
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
