
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArticleForm, ArticleFormValues } from "@/components/articles/form";
import { Article } from "@/types/articles";

interface ArticleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentArticle: Article | null;
  onSubmit: (data: ArticleFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function ArticleFormDialog({
  open,
  onOpenChange,
  currentArticle,
  onSubmit,
  isSubmitting
}: ArticleFormDialogProps) {
  // Log the input data to verify we're getting what we expect
  React.useEffect(() => {
    if (currentArticle && open) {
      console.log("ArticleFormDialog opening with article:", {
        id: currentArticle.id,
        title: currentArticle.title,
        contentLength: currentArticle.content?.length || 0,
        hasVoice: Boolean(currentArticle.voice_url),
        voiceGenerated: currentArticle.voice_generated
      });
    }
  }, [currentArticle, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogTitle>
          {currentArticle ? "Edit Article" : "Create New Article"}
        </DialogTitle>
        <DialogDescription>
          {currentArticle 
            ? "Make changes to your article content, SEO, and voice settings." 
            : "Create a new article with AI-generated content and voice."
          }
        </DialogDescription>
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
                // Don't include voiceSegments if it doesn't exist in the type
                moralLevel: currentArticle.moral_level || 5,
                theme: currentArticle.title, // Use title as initial theme for editing
                contentType: "article",
                platform: currentArticle.category || "web",
                contentLength: determineContentLength(currentArticle.content),
                tone: "informative",
              } : undefined}
              mode={currentArticle ? 'edit' : 'create'}
              onSubmit={onSubmit}
              onCancel={() => onOpenChange(false)}
              isLoading={isSubmitting}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

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
