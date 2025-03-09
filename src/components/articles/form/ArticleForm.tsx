
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Article } from "@/types/articles";
import { ArticleFormFields } from "./ArticleFormFields";
import { AIGenerationDialog } from "./AIGenerationDialog";

interface ArticleFormProps {
  initialData?: Partial<Article>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  generateArticle?: (params: any) => Promise<any>;
}

export function ArticleForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  generateArticle
}: ArticleFormProps) {
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const defaultValues = {
    title: initialData?.title || "",
    content: initialData?.content || "",
    category: initialData?.category || "",
    status: initialData?.status || "draft",
    seo_keywords: initialData?.seo_keywords?.join(", ") || "",
    meta_description: initialData?.meta_description || "",
    featured_image: initialData?.featured_image || "",
    publish_date: initialData?.publish_date ? new Date(initialData.publish_date) : undefined,
  };

  const form = useForm({ defaultValues });

  const handleGenerateAI = async (generationParams: any) => {
    if (!generateArticle) {
      toast.error("AI generation not available");
      return;
    }

    try {
      const result = await generateArticle(generationParams);

      if (result) {
        form.setValue("title", result.title);
        form.setValue("content", result.content);
        form.setValue("meta_description", result.metaDescription);
        form.setValue("seo_keywords", result.keywords.join(", "));
        form.setValue("category", generationParams.theme);
        setAiDialogOpen(false);
        toast.success("Content generated successfully");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">{initialData?.id ? "Edit Article" : "Create Article"}</h2>
            
            {generateArticle && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setAiDialogOpen(true)}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
            )}
          </div>

          <ArticleFormFields form={form} />

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData?.id ? "Update" : "Create"} Article
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-4xl">
          <ScrollArea className="max-h-[80vh]">
            <AIGenerationDialog 
              onGenerate={handleGenerateAI} 
              onCancel={() => setAiDialogOpen(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
