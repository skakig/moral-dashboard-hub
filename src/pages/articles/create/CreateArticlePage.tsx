
import { ArticleForm } from "@/components/articles/form";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useArticleMutations } from "@/hooks/articles/useArticleMutations";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/errorHandling";
import { ErrorDisplay } from "@/components/ui/error-display";

export default function CreateArticlePage() {
  const navigate = useNavigate();
  const { createArticle } = useArticleMutations();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<any>(null);
  const queryClient = useQueryClient();
  
  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    setError(null);
    
    try {
      // Format SEO keywords if they exist
      const formattedData = {
        ...data,
        seo_keywords: data.seoKeywords 
          ? (typeof data.seoKeywords === 'string' 
              ? data.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) 
              : data.seoKeywords) 
          : []
      };

      console.log("Creating article from standalone page:", {
        title: formattedData.title,
        hasContent: Boolean(formattedData.content),
        contentLength: formattedData.content?.length || 0,
        hasVoiceUrl: Boolean(formattedData.voiceUrl),
        voiceGenerated: formattedData.voiceGenerated,
        keywordsCount: formattedData.seo_keywords?.length || 0,
        moralLevel: formattedData.moralLevel
      });

      // Ensure we have required fields
      if (!formattedData.title) {
        toast.error("Title is required");
        setIsSaving(false);
        return;
      }

      // Make the mutation with improved error handling
      toast.info("Creating article...");
      
      const result = await createArticle.mutateAsync(formattedData);
      
      console.log("Article creation result:", {
        id: result?.id,
        title: result?.title,
        success: Boolean(result)
      });
      
      toast.success(`"${formattedData.title}" created successfully`);
      
      // Invalidate the articles query to ensure the list is refreshed
      await queryClient.invalidateQueries({ queryKey: ['articles'] });
      
      // Navigate back to the articles list after a short delay
      setTimeout(() => {
        navigate("/articles");
      }, 1000);
    } catch (error: any) {
      console.error('Error saving article:', error);
      
      // Enhanced error logging
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });

      const processedError = handleError(error, {
        component: 'CreateArticlePage',
        action: 'create-article',
        articleTitle: data.title
      });
      
      setError(processedError);
      
      toast.error(`Failed to create article: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Article</h1>
            <p className="text-muted-foreground">
              Create a new article with AI assistance
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/articles")}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
        
        {error && (
          <ErrorDisplay 
            error={error}
            title="Error creating article"
            variant="destructive"
            showRetry={false}
            className="mb-6"
          />
        )}
        
        <div className="max-w-5xl mx-auto">
          <ArticleForm
            onSubmit={handleSubmit}
            submitLabel={isSaving ? "Creating..." : "Create Article"}
            onCancel={() => navigate("/articles")}
            isLoading={isSaving}
          />
        </div>
      </div>
    </AppLayout>
  );
}
