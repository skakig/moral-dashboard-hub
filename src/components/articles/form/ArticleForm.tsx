
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArticleFormFields } from "./ArticleFormFields";
import { StepByStepArticleForm } from "./StepByStepArticleForm";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Article form schema
const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featuredImage: z.string().optional(),
  contentType: z.string().optional(),
  platform: z.string().optional(),
  contentLength: z.string().optional(),
  tone: z.string().optional(),
  metaDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  voiceUrl: z.string().optional(),
  voiceGenerated: z.boolean().optional().default(false),
  moralLevel: z.string().or(z.number()).optional().default(5),
  theme: z.string().optional(),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ArticleFormProps {
  initialData?: Partial<ArticleFormValues>;
  onSubmit?: (values: ArticleFormValues) => void;
  submitLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ArticleForm({
  initialData = {},
  onSubmit: onFormSubmit,
  submitLabel = "Create",
  onCancel,
  isLoading = false,
}: ArticleFormProps) {
  const [formView, setFormView] = useState<"classic" | "wizard">("wizard");

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      contentType: "",
      platform: "",
      contentLength: "medium",
      tone: "informative",
      metaDescription: "",
      seoKeywords: "",
      voiceUrl: "",
      voiceGenerated: false,
      moralLevel: 5,
      theme: "",
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

  return (
    <div className="space-y-8">
      <Tabs defaultValue="wizard" onValueChange={(value) => setFormView(value as "classic" | "wizard")}>
        <TabsList className="mb-6">
          <TabsTrigger value="wizard">Step-by-Step</TabsTrigger>
          <TabsTrigger value="classic">All Fields</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wizard">
          <StepByStepArticleForm
            initialData={initialData}
            onSubmit={onFormSubmit}
            submitLabel={submitLabel}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="classic">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <ArticleFormFields form={form} />

              <div className="flex items-center justify-between">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {submitLabel}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
