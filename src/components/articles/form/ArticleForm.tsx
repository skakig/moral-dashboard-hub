
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
import { History } from "lucide-react";

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
  voiceFileName: z.string().optional(),
  voiceBase64: z.string().optional(),
  moralLevel: z.string().or(z.number()).optional().default(5),
  theme: z.string().optional(),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ArticleFormProps {
  initialData?: Partial<ArticleFormValues>;
  onSubmit?: (values: ArticleFormValues) => void;
  submitLabel?: string;
  onCancel?: () => void;
  onRevert?: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export function ArticleForm({
  initialData = {},
  onSubmit: onFormSubmit,
  submitLabel = "Create",
  onCancel,
  onRevert,
  isLoading = false,
  isEditing = false,
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
      voiceFileName: "",
      voiceBase64: "",
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

  const handleRevert = () => {
    if (onRevert) {
      // First confirm with the user
      if (window.confirm("Are you sure you want to revert to the previous version? All current changes will be lost.")) {
        onRevert();
        toast.info("Reverted to previous version");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <Tabs value={formView} onValueChange={(value) => setFormView(value as "classic" | "wizard")}>
          <TabsList className="mb-6">
            <TabsTrigger value="wizard">Step-by-Step</TabsTrigger>
            <TabsTrigger value="classic">All Fields</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wizard" className="mt-0">
            <StepByStepArticleForm
              initialData={initialData}
              onSubmit={onFormSubmit}
              submitLabel={submitLabel}
              onCancel={onCancel}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="classic" className="mt-0">
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
        
        {isEditing && onRevert && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRevert}
            className="mb-6 flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Revert to Previous
          </Button>
        )}
      </div>
    </div>
  );
}
