
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArticleForm, ArticleFormValues } from "@/components/articles/form";
import { Article } from "@/types/articles";
import { toast } from "sonner";

interface UseArticleFormDialogProps {
  onSubmit: (data: ArticleFormValues) => Promise<void>;
}

export function useArticleFormDialog({
  onSubmit
}: UseArticleFormDialogProps) {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousArticleVersion, setPreviousArticleVersion] = useState<Article | null>(null);
  const formSubmittedRef = useRef(false);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // When an article is loaded for editing, store the previous version for version control
  useEffect(() => {
    if (currentArticle && currentArticle !== previousArticleVersion) {
      setPreviousArticleVersion(currentArticle);
    }
  }, [currentArticle, previousArticleVersion]);

  // Reset submission state when dialog closes
  useEffect(() => {
    if (!formDialogOpen) {
      formSubmittedRef.current = false;
      
      // Clear any pending timeouts
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
    }
  }, [formDialogOpen]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const handleCreateArticle = () => {
    setCurrentArticle(null);
    setPreviousArticleVersion(null);
    formSubmittedRef.current = false;
    setFormDialogOpen(true);
  };

  const handleEditArticle = (article: Article) => {
    // Log the article we're editing to debug any issues
    console.log("Editing article:", {
      id: article.id,
      title: article.title,
      hasVoiceData: Boolean(article.voice_url),
      voiceGenerated: article.voice_generated
    });
    
    // Map DB field names to form field names
    const mappedArticle = {
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      metaDescription: article.meta_description || '',
      featuredImage: article.featured_image || '',
      seoKeywords: Array.isArray(article.seo_keywords) ? article.seo_keywords.join(', ') : '',
      voiceUrl: article.voice_url || '',
      voiceGenerated: article.voice_generated || false,
      voiceFileName: article.voice_file_name || '',
      voiceBase64: article.voice_base64 || '',
      moralLevel: article.moral_level || 5,
      platform: article.category || '',
      contentType: '',  // Default to empty if not provided
      contentLength: 'medium', // Default to medium if not provided
      tone: 'informative', // Default to informative if not provided
    };
    
    setCurrentArticle(article);
    formSubmittedRef.current = false;
    setFormDialogOpen(true);
  };

  const handleRevertChanges = () => {
    if (previousArticleVersion) {
      setCurrentArticle(previousArticleVersion);
      toast.success("Reverted to previous version of the article");
    } else {
      toast.error("No previous version available to revert to");
    }
  };

  const handleFormSubmit = async (data: ArticleFormValues) => {
    // Prevent duplicate submissions
    if (formSubmittedRef.current || isSubmitting) {
      console.log("Preventing duplicate submission");
      return;
    }
    
    try {
      formSubmittedRef.current = true;
      setIsSubmitting(true);
      
      // Log what we're about to submit
      console.log("Submitting article form:", {
        title: data.title,
        hasVoiceData: Boolean(data.voiceUrl),
        voiceGenerated: data.voiceGenerated
      });
      
      // Show pending notification for large articles
      const hasLargeVoiceData = data.voiceBase64 && data.voiceBase64.length > 500000;
      if (hasLargeVoiceData) {
        toast.info("Processing large voice data. This may take a moment...");
      }
      
      // If currentArticle exists, add its ID to the data
      const submitData = currentArticle 
        ? { ...data, id: currentArticle.id } 
        : data;
        
      await onSubmit(submitData);
      
      // Set timeout before closing dialog to prevent multiple submissions
      // and to allow time for the server to process the request
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
      
      submitTimeoutRef.current = setTimeout(() => {
        setFormDialogOpen(false);
      
        // Update the previous version after successful save
        if (currentArticle) {
          setPreviousArticleVersion({
            ...currentArticle,
            title: data.title,
            content: data.content || '',
            meta_description: data.metaDescription || '',
            featured_image: data.featuredImage || '',
            seo_keywords: data.seoKeywords ? data.seoKeywords.split(',').map(k => k.trim()).filter(Boolean) : [],
            voice_url: data.voiceUrl || '',
            voice_generated: data.voiceGenerated || false,
            voice_file_name: data.voiceFileName || '',
            voice_base64: data.voiceBase64 || '',
            moral_level: data.moralLevel ? Number(data.moralLevel) : 5,
            category: data.platform || 'General',
          });
        }
        
        submitTimeoutRef.current = null;
      }, 1000);
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Failed to save article");
      // Reset submission flag on error so user can try again
      formSubmittedRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderArticleFormDialog = () => (
    <Dialog open={formDialogOpen} onOpenChange={(open) => {
      // Prevent closing the dialog during submission
      if (isSubmitting) return;
      setFormDialogOpen(open);
    }}>
      <DialogContent className="max-w-4xl">
        <ScrollArea className="max-h-[80vh]">
          <div className="p-1">
            <ArticleForm
              initialData={currentArticle ? {
                title: currentArticle.title,
                content: currentArticle.content,
                excerpt: currentArticle.excerpt || '',
                metaDescription: currentArticle.meta_description || '',
                featuredImage: currentArticle.featured_image || '',
                seoKeywords: Array.isArray(currentArticle.seo_keywords) ? currentArticle.seo_keywords.join(', ') : '',
                voiceUrl: currentArticle.voice_url || '',
                voiceGenerated: currentArticle.voice_generated || false,
                voiceFileName: currentArticle.voice_file_name || '',
                voiceBase64: currentArticle.voice_base64 || '',
                moralLevel: currentArticle.moral_level || 5,
                platform: currentArticle.category || '',
                contentType: '',
                contentLength: 'medium',
                tone: 'informative',
                theme: '',
              } : undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                // Only allow cancellation if not submitting
                if (!isSubmitting) {
                  setFormDialogOpen(false);
                }
              }}
              onRevert={previousArticleVersion ? handleRevertChanges : undefined}
              isLoading={isSubmitting}
              isEditing={Boolean(currentArticle)}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  return {
    formDialogOpen,
    setFormDialogOpen,
    currentArticle,
    setCurrentArticle,
    handleCreateArticle,
    handleEditArticle,
    renderArticleFormDialog,
    isSubmitting
  };
}
