
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticlesTab } from "./tabs/ArticlesTab";
import { ThemesTab } from "./tabs/ThemesTab";
import { useArticleFormDialog } from "./hooks/useArticleFormDialog";
import { useThemeFormDialog } from "./hooks/useThemeFormDialog";
import { useArticles } from "@/hooks/useArticles";
import { useContentThemes } from "@/hooks/useContentThemes";
import { Article } from "@/types/articles";
import { useArticleOperations } from "./hooks/useArticleOperations";
import { ArticleFormDialog } from "./components/ArticleFormDialog";

export default function ArticlesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch articles and themes
  const { 
    articles, 
    isLoading: articlesLoading, 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter,
    createArticle,
    updateArticle
  } = useArticles();

  const {
    themes,
    isLoading: themesLoading,
    createTheme,
    updateTheme,
    deleteTheme
  } = useContentThemes();

  // Article operations
  const { 
    handleViewArticle, 
    handlePublishArticle, 
    handleDownloadArticle,
    deleteArticle
  } = useArticleOperations();

  // Article form dialog state management
  const { 
    formDialogOpen: articleFormDialogOpen, 
    setFormDialogOpen: setArticleFormDialogOpen,
    currentArticle,
    setCurrentArticle,
    handleCreateArticle,
    handleEditArticle
  } = useArticleFormDialog({
    onSubmit: handleArticleSubmit
  });

  // Theme form dialog state management
  const {
    formDialogOpen: themeFormDialogOpen,
    setFormDialogOpen: setThemeFormDialogOpen,
    currentTheme,
    setCurrentTheme,
    handleCreateTheme,
    handleEditTheme,
    renderThemeFormDialog
  } = useThemeFormDialog({
    onSubmit: handleThemeSubmit
  });

  // Form submission handlers
  async function handleArticleSubmit(data: any) {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        seo_keywords: data.seoKeywords ? data.seoKeywords.split(',').map((k: string) => k.trim()) : []
      };

      if (currentArticle) {
        await updateArticle.mutateAsync({
          id: currentArticle.id,
          ...formattedData
        });
      } else {
        await createArticle.mutateAsync({
          ...formattedData,
          category: "general" // Add a default category for new articles
        });
      }
      setArticleFormDialogOpen(false);
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleThemeSubmit(data: any) {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        keywords: data.keywords ? data.keywords.split(',').map((k: string) => k.trim()) : []
      };

      if (currentTheme) {
        await updateTheme.mutateAsync({
          id: currentTheme.id,
          ...formattedData
        });
      } else {
        await createTheme.mutateAsync(formattedData);
      }
      setThemeFormDialogOpen(false);
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error('Failed to save theme');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Manage content, monitor performance, and schedule publications
          </p>
        </div>
        
        <Tabs defaultValue="articles">
          <TabsList>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="themes">Content Themes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="articles" className="mt-6">
            <ArticlesTab
              articles={articles || []}
              isLoading={articlesLoading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onCreateNew={handleCreateArticle}
              onEdit={handleEditArticle}
              onDelete={deleteArticle.mutate}
              onView={handleViewArticle}
              onPublish={handlePublishArticle}
              onDownload={handleDownloadArticle}
            />
          </TabsContent>
          
          <TabsContent value="themes" className="mt-6">
            <ThemesTab
              themes={themes || []}
              isLoading={themesLoading}
              onCreateNew={handleCreateTheme}
              onEdit={handleEditTheme}
              onDelete={deleteTheme.mutate}
            />
          </TabsContent>
        </Tabs>
        
        <ArticleFormDialog
          open={articleFormDialogOpen}
          onOpenChange={setArticleFormDialogOpen}
          currentArticle={currentArticle}
          onSubmit={handleArticleSubmit}
          isSubmitting={isSubmitting}
        />
        
        {renderThemeFormDialog(isSubmitting)}
      </div>
    </AppLayout>
  );
}
