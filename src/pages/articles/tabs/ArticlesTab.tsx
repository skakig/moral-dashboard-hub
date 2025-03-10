
import { ArticleToolbar } from "@/components/articles/ArticleToolbar";
import { ArticlesTable } from "@/components/articles/ArticlesTable";
import { Loader2 } from "lucide-react";
import { Article } from "@/types/articles";
import { toast } from "sonner";
import { useState } from "react";
import { useArticleMutations } from "@/hooks/articles/useArticleMutations";

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

  // Handle publishing an article
  const handlePublish = async (article: Article) => {
    try {
      setPublishingArticle(article.id);
      
      // Instead of directly setting status in the mutation, we need to use the proper form field mapping
      // Using "as any" here as a temporary workaround to bypass the type check
      // A better solution would be to update the type definitions or the mapper function
      await updateArticle.mutateAsync({
        id: article.id,
        // These fields will be mapped to the DB columns by mapFormToDbArticle
        publish_date: new Date().toISOString()
      } as any);
      
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
    // Normally this would navigate to a public view or open the article in a new tab
    // For now, we'll just use the preview dialog in ArticlesTable
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
