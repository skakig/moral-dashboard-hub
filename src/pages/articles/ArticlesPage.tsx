
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
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function ArticlesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Articles functionality
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
    renderArticleFormDialog
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

  // Article submission handler
  async function handleArticleSubmit(data: any) {
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
      setArticleFormDialogOpen(false);
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
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

  // Handle View action
  const handleViewArticle = (article: Article) => {
    // In a real implementation, this would navigate to the article view
    // For now, just show a toast message
    toast.info(`Viewing article: ${article.title}`);
    window.open(`/articles/${article.id}`, '_blank');
  };

  // Handle Publish action
  const handlePublishArticle = async (article: Article) => {
    try {
      await updateArticle.mutateAsync({
        id: article.id,
        status: 'published',
        publish_date: new Date().toISOString()
      });
      toast.success(`Article "${article.title}" has been published`);
    } catch (error) {
      console.error('Error publishing article:', error);
      toast.error('Failed to publish article');
    }
  };

  // Handle Download action
  const handleDownloadArticle = async (article: Article) => {
    try {
      toast.info('Preparing content for download...');
      
      // Create a new zip file
      const zip = new JSZip();
      
      // Add article content as HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${article.title}</title>
          <meta name="description" content="${article.meta_description || ''}">
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            img { max-width: 100%; height: auto; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>${article.title}</h1>
          ${article.content}
        </body>
        </html>
      `;
      zip.file(`${article.title}.html`, htmlContent);
      
      // Add text version
      zip.file(`${article.title}.txt`, `${article.title}\n\n${article.content.replace(/<[^>]*>/g, '')}`);
      
      // If there's a featured image, add it
      if (article.featured_image) {
        try {
          const imgResponse = await fetch(article.featured_image);
          const imgBlob = await imgResponse.blob();
          zip.file(`images/featured-image.${imgBlob.type.split('/')[1] || 'jpg'}`, imgBlob);
        } catch (imgError) {
          console.error('Error fetching featured image:', imgError);
        }
      }
      
      // If there's voice content, add it
      if (article.voice_url) {
        try {
          const audioResponse = await fetch(article.voice_url);
          const audioBlob = await audioResponse.blob();
          zip.file(`audio/${article.voice_file_name || 'voice-content.mp3'}`, audioBlob);
        } catch (audioError) {
          console.error('Error fetching voice content:', audioError);
        }
      }
      
      // Add metadata JSON
      const metadata = {
        title: article.title,
        description: article.meta_description,
        keywords: article.seo_keywords,
        platform: article.category,
        moralLevel: article.moral_level,
        createdAt: article.created_at,
        status: article.status
      };
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Save the zip file
      saveAs(content, `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_content.zip`);
      
      toast.success('Content downloaded successfully');
    } catch (error) {
      console.error('Error downloading article content:', error);
      toast.error('Failed to download content');
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
        
        {/* Form Dialogs */}
        {renderArticleFormDialog()}
        {renderThemeFormDialog(isSubmitting)}
      </div>
    </AppLayout>
  );
}
