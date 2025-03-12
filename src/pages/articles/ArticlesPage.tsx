
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
import { useArticleVersions } from "@/hooks/articles/useArticleVersions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ArticlesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // Track retry attempts
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null); // Track when the last save occurred

  // Articles functionality
  const { 
    articles, 
    isLoading: articlesLoading, 
    error: articlesError,
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter,
    createArticle,
    updateArticle,
    deleteArticle,
    generateArticle,
    refetch
  } = useArticles();

  // Version control for articles
  const { createVersion } = useArticleVersions();

  // Themes functionality
  const {
    themes,
    isLoading: themesLoading,
    createTheme,
    updateTheme,
    deleteTheme
  } = useContentThemes();

  // Article form dialog management
  const { 
    formDialogOpen: articleFormDialogOpen, 
    setFormDialogOpen: setArticleFormDialogOpen,
    currentArticle,
    setCurrentArticle,
    handleCreateArticle,
    handleEditArticle,
    renderArticleFormDialog,
    isSubmitting: isDialogSubmitting
  } = useArticleFormDialog({
    onSubmit: handleArticleSubmit
  });

  // Theme form dialog management
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

  // Effect to refresh articles when coming to this page
  useEffect(() => {
    console.log("ArticlesPage mounted, fetching articles...");
    // Invalidate and refetch articles when the component mounts
    fetchArticlesWithErrorHandling();
  }, []);

  // Auto-retry on errors, with controlled retry count
  useEffect(() => {
    if (articlesError && retryCount < 2) {
      const timer = setTimeout(() => {
        console.log(`Auto-retrying fetch (attempt ${retryCount + 1})...`);
        setRetryCount(prev => prev + 1);
        fetchArticlesWithErrorHandling();
      }, 2000); // Wait 2 seconds before retrying
      
      return () => clearTimeout(timer);
    }
  }, [articlesError, retryCount]);

  // Effect to refresh articles after a save operation
  useEffect(() => {
    if (lastSaveTime) {
      const refreshTimer = setTimeout(() => {
        console.log("Refreshing articles after save operation...");
        fetchArticlesWithErrorHandling();
      }, 2000); // Extended wait time for Supabase to complete the transaction
      
      return () => clearTimeout(refreshTimer);
    }
  }, [lastSaveTime]);

  // Handle manual refresh with error handling
  const fetchArticlesWithErrorHandling = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      console.log("Articles refetched successfully");
    } catch (err) {
      console.error("Error refetching articles:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Display error if articles failed to load
  useEffect(() => {
    if (articlesError) {
      console.error("Articles fetch error:", articlesError);
      toast.error(`Failed to load articles: ${articlesError instanceof Error ? articlesError.message : 'Unknown error'}`);
    }
  }, [articlesError]);

  // Article submission handler
  async function handleArticleSubmit(data: any) {
    setIsSubmitting(true);
    try {
      // Convert comma-separated keywords string to array
      const formattedData = {
        ...data,
        seo_keywords: data.seo_keywords ? data.seo_keywords.split(',').map((k: string) => k.trim()) : []
      };

      // Log what we're trying to save
      console.log("Saving article:", { 
        title: formattedData.title,
        hasContent: Boolean(formattedData.content),
        isUpdate: Boolean(currentArticle)
      });

      let result;
      if (currentArticle) {
        // Update existing article
        result = await updateArticle.mutateAsync({
          id: currentArticle.id,
          ...formattedData
        });
        toast.success("Article updated successfully");

        // Create a version after successful update
        if (result) {
          createVersion({
            ...currentArticle,
            title: data.title,
            content: data.content,
            meta_description: data.metaDescription,
            featured_image: data.featuredImage,
            voice_url: data.voiceUrl,
            voice_generated: data.voiceGenerated,
            voice_file_name: data.voiceFileName,
            voice_base64: data.voiceBase64,
          });
        }
      } else {
        // Create new article
        result = await createArticle.mutateAsync(formattedData);
        toast.success("Article created successfully");
      }
      
      // Close the form dialog
      setArticleFormDialogOpen(false);
      
      // Track the save time to trigger a refresh
      setLastSaveTime(Date.now());
      
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Theme submission handler
  async function handleThemeSubmit(data: any) {
    setIsSubmitting(true);
    try {
      // Convert comma-separated keywords string to array
      const formattedData = {
        ...data,
        keywords: data.keywords ? data.keywords.split(',').map((k: string) => k.trim()) : []
      };

      if (currentTheme) {
        // Update existing theme
        await updateTheme.mutateAsync({
          id: currentTheme.id,
          ...formattedData
        });
      } else {
        // Create new theme
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
        
        {articlesError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load articles: {articlesError instanceof Error ? articlesError.message : 'Unknown error'}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchArticlesWithErrorHandling}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
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
              onRefresh={fetchArticlesWithErrorHandling}
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
        
        {/* Form Dialogs */}
        {renderArticleFormDialog()}
        {renderThemeFormDialog(isSubmitting)}
      </div>
    </AppLayout>
  );
}
