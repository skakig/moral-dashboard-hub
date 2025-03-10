
import { ArticleForm } from "@/components/articles/form";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useArticleMutations } from "@/hooks/articles/useArticleMutations";

export default function CreateArticlePage() {
  const navigate = useNavigate();
  const { createArticle } = useArticleMutations();
  
  const handleSubmit = async (data: any) => {
    try {
      // Convert comma-separated keywords string to array
      const formattedData = {
        ...data,
        seo_keywords: data.seoKeywords ? data.seoKeywords.split(',').map((k: string) => k.trim()) : []
      };

      await createArticle.mutateAsync(formattedData);
      toast.success("Article created successfully");
      navigate("/articles"); // Return to articles list
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
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
          <Button variant="outline" onClick={() => navigate("/articles")}>
            Cancel
          </Button>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <ArticleForm
            onSubmit={handleSubmit}
            submitLabel="Create Article"
            onCancel={() => navigate("/articles")}
          />
        </div>
      </div>
    </AppLayout>
  );
}
