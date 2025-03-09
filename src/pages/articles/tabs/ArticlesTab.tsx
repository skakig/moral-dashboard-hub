
import { ArticleToolbar } from "@/components/articles/ArticleToolbar";
import { ArticlesTable } from "@/components/articles/ArticlesTable";
import { Loader2 } from "lucide-react";
import { Article } from "@/types/articles";

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
  onView?: (article: Article) => void;
  onPublish?: (article: Article) => void;
  onDownload?: (article: Article) => void;
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
  onDelete,
  onView,
  onPublish,
  onDownload
}: ArticlesTabProps) {
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
          onView={onView}
          onPublish={onPublish}
          onDownload={onDownload}
        />
      )}
    </>
  );
}
