
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArticleFormFields } from "./ArticleFormFields";
import { AIGenerationDialog } from "./AIGenerationDialog";
import { toast } from "sonner";

// Article form schema
const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featuredImage: z.string().optional(),
  contentType: z.string().optional(),
  platform: z.string().optional(),
  contentLength: z.string().optional(),
  metaDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  voiceUrl: z.string().optional(),
  voiceGenerated: z.boolean().optional().default(false),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ArticleFormProps {
  initialData?: Partial<ArticleFormValues>;
  onSubmit?: (values: ArticleFormValues) => void;
  submitLabel?: string;
}

export function ArticleForm({
  initialData = {},
  onSubmit: onFormSubmit,
  submitLabel = "Create",
}: ArticleFormProps) {
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      contentType: "",
      platform: "",
      contentLength: "",
      metaDescription: "",
      seoKeywords: "",
      voiceUrl: "",
      voiceGenerated: false,
      ...initialData,
    },
  });

  async function onSubmit(data: ArticleFormValues) {
    try {
      if (onFormSubmit) {
        onFormSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting article form:", error);
      toast.error("Failed to save article");
    }
  }

  // Handle AI content generation
  const handleGenerateContent = async (generationParams: any) => {
    try {
      setIsGenerating(true);
      // Call the Supabase function to generate content
      const { data, error } = await supabase.functions.invoke(
        "generate-article",
        {
          body: {
            type: generationParams.contentType,
            platform: generationParams.platform,
            topic: generationParams.topic,
            tone: generationParams.tone,
            length: generationParams.contentLength,
          },
        }
      );

      if (error) {
        console.error("Generation error:", error);
        toast.error("Failed to generate content");
        return;
      }

      if (data?.content) {
        // Update the form with the generated content
        form.setValue("content", data.content);
        form.setValue("title", data.title || generationParams.topic);
        
        if (data.excerpt) {
          form.setValue("excerpt", data.excerpt);
        }
        
        toast.success("Content generated successfully");
        
        // Close the dialog
        setIsAIDialogOpen(false);
      }
    } catch (err) {
      console.error("Error generating content:", err);
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  // This handles the actual content generation when submitted
  const onContentGenerated = (generatedContent: any) => {
    if (generatedContent) {
      form.setValue("content", generatedContent.content);
      form.setValue("title", generatedContent.title || "");
      form.setValue("excerpt", generatedContent.excerpt || "");
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <ArticleFormFields form={form} />

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAIDialogOpen(true)}
            >
              Generate with AI
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </Form>

      <AIGenerationDialog
        open={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        onContentGenerated={onContentGenerated}
      />
    </div>
  );
}
