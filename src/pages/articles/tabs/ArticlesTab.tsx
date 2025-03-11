
import { ArticleToolbar } from "@/components/articles/ArticleToolbar";
import { ArticlesTable } from "@/components/articles/ArticlesTable";
import { Loader2, RefreshCw } from "lucide-react";
import { Article } from "@/types/articles";
import { toast } from "sonner";
import { useState } from "react";
import { useArticleMutations } from "@/hooks/articles/useArticleMutations";
import { useNavigate } from "react-router-dom";
import { mapFormToDbArticle } from "@/hooks/articles/utils/articleMappers";
import { Button } from "@/components/ui/button";

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
  onRefresh?: () => void;
}

export function ArticlesTab({
  articles,
  isLoading,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onEdit,
  onDelete,
  onCreateNew,
  onRefresh
}: ArticlesTabProps) {
  const navigate = useNavigate();
  const { updateArticle } = useArticleMutations();
  const [publishingArticle, setPublishingArticle] = useState<string | null>(null);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePublish = async (article: Article) => {
    try {
      setPublishingArticle(article.id);
      
      const publishData = {
        id: article.id,
        publish_date: new Date().toISOString(),
        status: 'published'
      };
      
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

  const handleView = (article: Article) => {
    setViewingArticle(article);
  };

  const handleCreateNew = () => {
    onCreateNew ? onCreateNew() : navigate("/articles/create");
  };

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        toast.success("Articles refreshed");
      } catch (error) {
        console.error("Error refreshing articles:", error);
        toast.error("Failed to refresh articles");
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <ArticleToolbar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          onCreateNew={handleCreateNew}
        />
        
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="ml-4"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-muted-foreground mb-4">No articles found</p>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Articles
          </Button>
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
