
import { useState } from "react";
import { toast } from "sonner";
import { Article } from "@/types/articles";
import { useArticles } from "@/hooks/useArticles";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export function useArticleOperations() {
  const { 
    updateArticle,
    deleteArticle
  } = useArticles();

  const handleViewArticle = (article: Article) => {
    window.open(`/articles/${article.id}`, '_blank');
  };

  const handlePublishArticle = async (article: Article) => {
    try {
      await updateArticle.mutateAsync({
        id: article.id,
        seo_keywords: Array.isArray(article.seo_keywords) ? article.seo_keywords : [],
        meta_description: article.meta_description || "Article published on " + new Date().toLocaleDateString(),
        title: article.title,
        content: article.content,
        // Explicitly set status to "published"
        status: "published" as const
      });
      toast.success(`Article "${article.title}" has been published`);
    } catch (error) {
      console.error('Error publishing article:', error);
      toast.error('Failed to publish article');
    }
  };

  const handleDownloadArticle = async (article: Article) => {
    try {
      toast.info('Preparing content for download...');
      
      const zip = new JSZip();
      
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
      
      zip.file(`${article.title}.txt`, `${article.title}\n\n${article.content.replace(/<[^>]*>/g, '')}`);
      
      if (article.featured_image) {
        try {
          const imgResponse = await fetch(article.featured_image);
          const imgBlob = await imgResponse.blob();
          zip.file(`images/featured-image.${imgBlob.type.split('/')[1] || 'jpg'}`, imgBlob);
        } catch (imgError) {
          console.error('Error fetching featured image:', imgError);
        }
      }
      
      if (article.voice_url) {
        try {
          const audioResponse = await fetch(article.voice_url);
          const audioBlob = await audioResponse.blob();
          zip.file(`audio/${article.voice_file_name || 'voice-content.mp3'}`, audioBlob);
        } catch (audioError) {
          console.error('Error fetching voice content:', audioError);
        }
      }
      
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
      
      const content = await zip.generateAsync({ type: 'blob' });
      
      saveAs(content, `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_content.zip`);
      
      toast.success('Content downloaded successfully');
    } catch (error) {
      console.error('Error downloading article content:', error);
      toast.error('Failed to download content');
    }
  };

  return {
    handleViewArticle,
    handlePublishArticle,
    handleDownloadArticle,
    deleteArticle
  };
}
