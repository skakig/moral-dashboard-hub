
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArticleForm } from "@/components/articles/form";
import { Article } from "@/types/articles";

interface UseArticleFormDialogProps {
  onSubmit: (data: any) => Promise<void>;
  generateArticle?: (params: any) => Promise<any>;
}

export function useArticleFormDialog({
  onSubmit,
  generateArticle
}: UseArticleFormDialogProps) {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

  const handleCreateArticle = () => {
    setCurrentArticle(null);
    setFormDialogOpen(true);
  };

  const handleEditArticle = (article: Article) => {
    setCurrentArticle(article);
    setFormDialogOpen(true);
  };

  const renderArticleFormDialog = (isSubmitting: boolean) => (
    <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
      <DialogContent className="max-w-4xl">
        <ScrollArea className="max-h-[80vh]">
          <div className="p-1">
            <ArticleForm
              initialData={currentArticle || undefined}
              onSubmit={onSubmit}
              onCancel={() => setFormDialogOpen(false)}
              isLoading={isSubmitting}
              generateArticle={generateArticle}
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
