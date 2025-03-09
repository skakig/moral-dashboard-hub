
import { useState, useEffect } from "react";
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
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const handleCreateArticle = () => {
    setCurrentArticle(null);
    setFormMode('create');
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
      theme: article.title, // Use title as initial theme when editing
      // These fields might not exist in the Article type, but we handle them safely
      excerpt: article.excerpt || '',
      metaDescription: article.meta_description || '',
      featuredImage: article.featured_image || '',
      seoKeywords: Array.isArray(article.seo_keywords) ? article.seo_keywords.join(', ') : '',
      // Add voice fields with safe fallbacks
      voiceUrl: article.voice_url || '',
      voiceGenerated: article.voice_generated || false,
      voiceFileName: article.voice_file_name || '',
      voiceBase64: article.voice_base64 || '',
      moralLevel: article.moral_level || 5,
      contentType: "article", // Default type
      platform: article.category || "web", // Use category as platform
      contentLength: determineContentLength(article.content),
      tone: "informative", // Default tone
    };
    
    setCurrentArticle(article);
    setFormMode('edit');
    setFormDialogOpen(true);
  };

  // Helper function to determine content length based on word count
  const determineContentLength = (content: string): string => {
    if (!content) return 'medium';
    
    const wordCount = content.split(/\s+/).length;
    
    if (wordCount > 5000) return 'comprehensive';
    if (wordCount > 3000) return 'in-depth';
    if (wordCount > 1500) return 'long';
    if (wordCount > 500) return 'medium';
    return 'short';
  };

  const handleFormSubmit = async (data: ArticleFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Log what we're about to submit
      console.log("Submitting article form:", {
        title: data.title,
        hasVoiceData: Boolean(data.voiceUrl),
        voiceGenerated: data.voiceGenerated,
        mode: formMode
      });
      
      // If currentArticle exists, add its ID to the data
      const submitData = currentArticle 
        ? { ...data, id: currentArticle.id } 
        : data;
        
      await onSubmit(submitData);
      setFormDialogOpen(false);
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderArticleFormDialog = () => (
    <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
      <DialogContent className="max-w-4xl">
        <ScrollArea className="max-h-[80vh]">
          <div className="p-1">
            <ArticleForm
              initialData={currentArticle ? {
                title: currentArticle.title,
                content: currentArticle.content,
                theme: currentArticle.title, // Use title as initial theme
                // Again, handle properties that might not exist in the Article type
                excerpt: currentArticle.excerpt || '',
                metaDescription: currentArticle.meta_description || '',
                featuredImage: currentArticle.featured_image || '',
                seoKeywords: Array.isArray(currentArticle.seo_keywords) ? currentArticle.seo_keywords.join(', ') : '',
                voiceUrl: currentArticle.voice_url || '',
                voiceGenerated: currentArticle.voice_generated || false,
                voiceFileName: currentArticle.voice_file_name || '',
                voiceBase64: currentArticle.voice_base64 || '',
                moralLevel: currentArticle.moral_level || 5,
                contentType: "article", // Default type
                platform: currentArticle.category || "web", // Use category as platform
                contentLength: determineContentLength(currentArticle.content),
                tone: "informative", // Default tone
              } : undefined}
              mode={formMode}
              onSubmit={handleFormSubmit}
              onCancel={() => setFormDialogOpen(false)}
              isLoading={isSubmitting}
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
    formMode,
    handleCreateArticle,
    handleEditArticle,
    renderArticleFormDialog
  };
}
