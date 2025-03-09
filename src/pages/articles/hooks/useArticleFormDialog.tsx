
import { useState } from "react";
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

  const handleCreateArticle = () => {
    setCurrentArticle(null);
    setFormDialogOpen(true);
  };

  const handleEditArticle = (article: Article) => {
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
      moralLevel: article.moral_level || 5,
      // Add any other fields that might be needed
    };
    
    setCurrentArticle(article);
    setFormDialogOpen(true);
  };

  const handleFormSubmit = async (data: ArticleFormValues) => {
    try {
      setIsSubmitting(true);
      
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
                excerpt: currentArticle.excerpt || '',
                metaDescription: currentArticle.meta_description || '',
                featuredImage: currentArticle.featured_image || '',
                seoKeywords: Array.isArray(currentArticle.seo_keywords) ? currentArticle.seo_keywords.join(', ') : '',
                voiceUrl: currentArticle.voice_url || '',
                voiceGenerated: currentArticle.voice_generated || false,
                moralLevel: currentArticle.moral_level || 5,
              } : undefined}
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
    handleCreateArticle,
    handleEditArticle,
    renderArticleFormDialog
  };
}
