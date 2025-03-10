
import { ArticleToolbar } from "@/components/articles/ArticleToolbar";
import { ArticlesTable } from "@/components/articles/ArticlesTable";
import { Loader2 } from "lucide-react";
import { Article } from "@/types/articles";
import { toast } from "sonner";
import { useState } from "react";
import { useArticleMutations } from "@/hooks/articles/useArticleMutations";
import { mapFormToDbArticle } from "@/hooks/articles/utils/articleMappers";

interface ArticlesTabProps {
  articles: Article[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onCreateNew: () => void;
  onEdit: (article: Article) => void;
  onDelete: (articleId: string) => void;
}

export function ArticlesTab({
  articles,
  isLoading,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onCreateNew,
  onEdit,
  onDelete
}: ArticlesTabProps) {
  const { updateArticle } = useArticleMutations();
  const [publishingArticle, setPublishingArticle] = useState<string | null>(null);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);

  // Handle publishing an article
  const handlePublish = async (article: Article) => {
    try {
      setPublishingArticle(article.id);
      
      // Create a proper payload for publishing an article
      const publishData = {
        id: article.id,
        publish_date: new Date().toISOString()
      };
      
      // The mapper will properly format the publish_date and set status to 'published'
      const dbPayload = mapFormToDbArticle(publishData);
      
      await updateArticle.mutateAsync({
        id: article.id,
        ...dbPayload
      });
      
      toast.success(`"${article.title}" has been published successfully`);
    } catch (error) {
      console.error("Error publishing article:", error);
      toast.error("Failed to publish the article");
    } finally {
      setPublishingArticle(null);
    }
  };

  // Handle viewing an article
  const handleView = (article: Article) => {
    setViewingArticle(article);
  };

  return (
    <>
      <ArticleToolbar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        onCreateNew={onCreateNew}
      />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ArticlesTable
          articles={articles}
          onEdit={onEdit}
          onDelete={onDelete}
          onPublish={handlePublish}
          onView={handleView}
          viewingArticle={viewingArticle}
          setViewingArticle={setViewingArticle}
        />
      )}
      
      {publishingArticle && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center bg-card p-6 rounded-lg shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Publishing article...</p>
          </div>
        </div>
      )}
    </>
  );
}
