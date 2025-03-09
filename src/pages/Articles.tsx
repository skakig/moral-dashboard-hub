
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleToolbar } from "@/components/articles/ArticleToolbar";
import { ArticlesTable } from "@/components/articles/ArticlesTable";
import { ArticleForm } from "@/components/articles/form";
import { ThemeForm } from "@/components/themes/ThemeForm";
import { ThemesTable } from "@/components/themes/ThemesTable";
import { useArticles } from "@/hooks/useArticles";
import { useContentThemes } from "@/hooks/useContentThemes";
import { Article, ContentTheme } from "@/types/articles";

export default function Articles() {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [themeFormDialogOpen, setThemeFormDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ContentTheme | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    articles, 
    isLoading: articlesLoading, 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter,
    createArticle,
    updateArticle,
    deleteArticle,
    generateArticle
  } = useArticles();

  const {
    themes,
    isLoading: themesLoading,
    createTheme,
    updateTheme,
    deleteTheme
  } = useContentThemes();

  // Article form handlers
  const handleCreateArticle = () => {
    setCurrentArticle(null);
    setFormDialogOpen(true);
  };

  const handleEditArticle = (article: Article) => {
    setCurrentArticle(article);
    setFormDialogOpen(true);
  };

  const handleArticleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Convert comma-separated keywords string to array
      const formattedData = {
        ...data,
        seo_keywords: data.seo_keywords ? data.seo_keywords.split(',').map((k: string) => k.trim()) : []
      };

      if (currentArticle) {
        // Update existing article
        await updateArticle.mutateAsync({
          id: currentArticle.id,
          ...formattedData
        });
      } else {
        // Create new article
        await createArticle.mutateAsync(formattedData);
      }
      setFormDialogOpen(false);
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theme form handlers
  const handleCreateTheme = () => {
    setCurrentTheme(null);
    setThemeFormDialogOpen(true);
  };

  const handleEditTheme = (theme: ContentTheme) => {
    setCurrentTheme(theme);
    setThemeFormDialogOpen(true);
  };

  const handleThemeSubmit = async (data: any) => {
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
  };

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
            <ArticleToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onCreateNew={handleCreateArticle}
            />
            
            {articlesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ArticlesTable
                articles={articles || []}
                onEdit={handleEditArticle}
                onDelete={deleteArticle.mutate}
              />
            )}
          </TabsContent>
          
          <TabsContent value="themes" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button onClick={handleCreateTheme}>
                Add New Theme
              </Button>
            </div>
            
            {themesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ThemesTable
                themes={themes || []}
                onEdit={handleEditTheme}
                onDelete={deleteTheme.mutate}
              />
            )}
          </TabsContent>
        </Tabs>
        
        {/* Article Form Dialog */}
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogContent className="max-w-4xl">
            <ScrollArea className="max-h-[80vh]">
              <div className="p-1">
                <ArticleForm
                  initialData={currentArticle || undefined}
                  onSubmit={handleArticleSubmit}
                  onCancel={() => setFormDialogOpen(false)}
                  isLoading={isSubmitting}
                  generateArticle={generateArticle}
                />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        
        {/* Theme Form Dialog */}
        <Dialog open={themeFormDialogOpen} onOpenChange={setThemeFormDialogOpen}>
          <DialogContent>
            <ThemeForm
              initialData={currentTheme || undefined}
              onSubmit={handleThemeSubmit}
              onCancel={() => setThemeFormDialogOpen(false)}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
