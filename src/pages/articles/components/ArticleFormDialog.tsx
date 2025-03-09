
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              } : undefined}
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
