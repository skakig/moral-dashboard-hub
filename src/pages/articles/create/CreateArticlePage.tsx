
import { ArticleForm } from "@/components/articles/form";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useArticleMutations } from "@/hooks/articles/useArticleMutations";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateArticlePage() {
  const navigate = useNavigate();
  const { createArticle } = useArticleMutations();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  
  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      // Convert comma-separated keywords string to array
      const formattedData = {
        ...data,
        seo_keywords: data.seoKeywords ? data.seoKeywords.split(',').map((k: string) => k.trim()) : []
      };

      console.log("Creating article from standalone page:", {
        title: formattedData.title,
        hasContent: Boolean(formattedData.content)
      });

      await createArticle.mutateAsync(formattedData);
      toast.success("Article created successfully");
      
      // Invalidate the articles query to ensure the list is refreshed
      await queryClient.invalidateQueries({ queryKey: ['articles'] });
      
      // Give Supabase a moment to complete the transaction
      setTimeout(() => {
        navigate("/articles"); // Return to articles list
      }, 1000);
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
        
        <div className="max-w-5xl mx-auto">
          <ArticleForm
            onSubmit={handleSubmit}
            submitLabel="Create Article"
            onCancel={() => navigate("/articles")}
            isSubmitting={isSaving}
          />
        </div>
      </div>
    </AppLayout>
  );
}
