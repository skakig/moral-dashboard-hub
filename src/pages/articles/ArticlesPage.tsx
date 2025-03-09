
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

export default function ArticlesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Debug check for Supabase connection
  useEffect(() => {
    async function checkArticlesTable() {
      try {
        const { data, error, count } = await supabase
          .from('articles')
          .select('*', { count: 'exact' })
          .limit(1);
        
        setDebugInfo({ 
          hasData: Boolean(data?.length), 
          count,
          error: error ? error.message : null,
          sample: data?.[0] || null
        });
        
        if (error) {
          console.error("Supabase connection error:", error);
        } else {
          console.log("Supabase articles table accessible, count:", count);
        }
      } catch (err) {
        console.error("Failed to check articles table:", err);
        setDebugInfo({ error: String(err) });
      }
    }
    
    checkArticlesTable();
  }, []);

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
      console.log("Submitting article data:", data);
      
      const formattedData = {
        ...data,
        seo_keywords: data.seoKeywords ? data.seoKeywords.split(',').map((k: string) => k.trim()) : []
      };

      if (currentArticle) {
        await updateArticle.mutateAsync({
          id: currentArticle.id,
          ...formattedData
        });
        toast.success("Article updated successfully");
      } else {
        await createArticle.mutateAsync({
          ...formattedData,
          category: "general" // Add a default category for new articles
        });
        toast.success("Article created successfully");
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
        toast.success("Theme updated successfully");
      } else {
        await createTheme.mutateAsync(formattedData);
        toast.success("Theme created successfully");
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
        
        {debugInfo && debugInfo.error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
            <h3 className="font-semibold">Database Connection Error:</h3>
            <p>{debugInfo.error}</p>
          </div>
        )}
        
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
