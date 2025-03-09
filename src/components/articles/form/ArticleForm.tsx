
import { useState, useEffect } from "react";
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
  voiceFileName: z.string().optional(),
  voiceBase64: z.string().optional(),
  moralLevel: z.string().or(z.number()).optional().default(5),
  theme: z.string().optional(),
  _autoGenerate: z.boolean().optional(),
  _autoGenerateOptions: z.any().optional(),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ArticleFormProps {
  initialData?: Partial<ArticleFormValues>;
  onSubmit?: (values: ArticleFormValues) => void;
  submitLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function ArticleForm({
  initialData = {},
  onSubmit: onFormSubmit,
  submitLabel = "Create",
  onCancel,
  isLoading = false,
  mode = 'create',
}: ArticleFormProps) {
  const [formView, setFormView] = useState<"classic" | "wizard">("wizard");
  const [sharedFormState, setSharedFormState] = useState<Partial<ArticleFormValues>>(initialData);

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

  // Update classic form when wizard form changes
  const handleWizardFormStateChange = (newState: Partial<ArticleFormValues>) => {
    setSharedFormState(current => ({ ...current, ...newState }));
  };
  
  // Update form values when shared state changes
  useEffect(() => {
    if (formView === "classic") {
      Object.entries(sharedFormState).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.setValue(key as any, value);
        }
      });
    }
  }, [formView, sharedFormState, form]);

  async function onSubmit(data: ArticleFormValues) {
    try {
      // Clean up internal fields
      const cleanedData = { ...data };
      delete cleanedData._autoGenerate;
      delete cleanedData._autoGenerateOptions;
      
      if (onFormSubmit) {
        onFormSubmit(cleanedData);
      }
    } catch (error) {
      console.error("Error submitting article form:", error);
      toast.error("Failed to save article");
    }
  }

  // Update shared state when classic form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (formView === "classic") {
        setSharedFormState(current => ({ ...current, ...value }));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, formView]);

  return (
    <div className="space-y-8">
      <Tabs defaultValue="wizard" onValueChange={(value) => setFormView(value as "classic" | "wizard")}>
        <TabsList className="mb-6">
          <TabsTrigger value="wizard">Step-by-Step</TabsTrigger>
          <TabsTrigger value="classic">All Fields</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wizard">
          <StepByStepArticleForm
            initialData={sharedFormState}
            onSubmit={onFormSubmit}
            submitLabel={submitLabel}
            onCancel={onCancel}
            isLoading={isLoading}
            mode={mode}
            parentFormState={sharedFormState}
            onFormStateChange={handleWizardFormStateChange}
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
