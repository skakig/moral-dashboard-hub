
import { Article } from "@/types/articles";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CalendarClock, 
  Eye, 
  FileEdit, 
  MoreHorizontal, 
  Trash, 
  Calendar, 
  Share2,
  ExternalLink,
  Volume,
  Play,
  Pause,
  Download,
  FileAudio,
  AlertTriangle
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface ArticlesTableProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (articleId: string) => void;
  onPublish?: (article: Article) => void;
  onView?: (article: Article) => void;
  viewingArticle?: Article | null;
  setViewingArticle?: (article: Article | null) => void;
}

export function ArticlesTable({ 
  articles, 
  onEdit, 
  onDelete,
  onPublish,
  onView,
  viewingArticle,
  setViewingArticle
}: ArticlesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(1);
  const [contentError, setContentError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update preview article when viewingArticle changes (for external control)
  useEffect(() => {
    if (viewingArticle) {
      setPreviewArticle(viewingArticle);
      setPreviewDialogOpen(true);
    }
  }, [viewingArticle]);

  // Clean up audio when dialog closes
  useEffect(() => {
    if (!previewDialogOpen && audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  }, [previewDialogOpen]);

  // Add logging to debug article content issues
  useEffect(() => {
    if (previewArticle) {
      console.log("Preview article data:", {
        id: previewArticle.id,
        title: previewArticle.title,
        hasContent: Boolean(previewArticle.content),
        contentLength: previewArticle.content?.length || 0,
        contentSample: previewArticle.content?.substring(0, 50),
        hasVoiceUrl: Boolean(previewArticle.voice_url),
        voiceGenerated: previewArticle.voice_generated
      });
      
      // Reset content error when new article is loaded
      setContentError(null);
    }
  }, [previewArticle]);

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      onDelete(articleToDelete.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleViewClick = (article: Article) => {
    if (onView) {
      onView(article);
    } else {
      // If no onView handler, open a preview dialog
      console.log("Opening article preview:", {
        id: article.id,
        title: article.title,
        hasContent: Boolean(article.content),
        contentSample: article.content?.substring(0, 50),
        hasVoiceUrl: Boolean(article.voice_url)
      });
      setPreviewArticle(article);
      setPreviewDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setPreviewDialogOpen(false);
    if (setViewingArticle) {
      setViewingArticle(null);
    }
    // Make sure audio stops when dialog closes
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  };

  const handlePublishClick = (article: Article) => {
    if (onPublish) {
      onPublish(article);
    }
  };

  const toggleAudioPlayback = () => {
    if (!previewArticle?.voice_url) {
      toast.error("No audio available");
      return;
    }
    
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        // Ensure the audio source is set correctly
        if (audioRef.current.src !== previewArticle.voice_url) {
          audioRef.current.src = previewArticle.voice_url;
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
    if (!previewArticle?.voice_url) {
      toast.error("No audio available to download");
      return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = previewArticle.voice_url;
      a.download = previewArticle.voice_file_name || 'voice-content.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Audio file downloaded successfully');
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast.error('Failed to download audio file');
    }
  };

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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Publish Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                No articles found
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className="font-medium">{article.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Views: {article.view_count || 0}
                    {article.voice_generated && (
                      <span className="ml-2 inline-flex items-center">
                        <FileAudio className="h-3 w-3 mr-1" />
                        Voice
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{article.category}</TableCell>
                <TableCell>{getStatusBadge(article.status)}</TableCell>
                <TableCell>
                  {article.created_at
                    ? format(new Date(article.created_at), "MMM d, yyyy")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {article.publish_date
                    ? format(new Date(article.publish_date), "MMM d, yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(article)}>
                        <FileEdit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewClick(article)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {article.status !== "published" && (
                        <DropdownMenuItem onClick={() => handlePublishClick(article)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Publish Now
                        </DropdownMenuItem>
                      )}
                      {article.voice_generated && article.voice_url && (
                        <DropdownMenuItem onClick={() => {
                          setPreviewArticle(article);
                          setPreviewDialogOpen(true);
                        }}>
                          <Volume className="mr-2 h-4 w-4" />
                          Play Audio
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Social Media
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(article)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to delete the article "{articleToDelete?.title}"? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Article Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewArticle?.title}</DialogTitle>
            <DialogDescription>
              {previewArticle?.excerpt || ""}
            </DialogDescription>
          </DialogHeader>

          {previewArticle?.featured_image && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
              <img 
                src={previewArticle.featured_image} 
                alt={previewArticle.title} 
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {previewArticle?.voice_url && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
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
                    {previewArticle.voice_file_name || "audio.mp3"}
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
                  src={previewArticle.voice_url} 
                  className="w-full" 
                  onEnded={handleAudioEnded}
                  onError={handleAudioError}
                  controls
                />
              </div>
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            {contentError && (
              <div className="flex items-center p-4 mb-4 text-amber-800 bg-amber-50 rounded-md">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                <p>{contentError}</p>
              </div>
            )}
            
            {previewArticle?.content ? (
              <div dangerouslySetInnerHTML={{ __html: previewArticle.content.replace(/\n/g, '<br />') }} />
            ) : (
              <p className="text-muted-foreground py-6 text-center border border-dashed rounded-md">
                No content available for this article.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Close
            </Button>
            {previewArticle && (
              <Button variant="default" onClick={() => {
                handleDialogClose();
                onEdit(previewArticle);
              }}>
                <FileEdit className="mr-2 h-4 w-4" />
                Edit Article
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
