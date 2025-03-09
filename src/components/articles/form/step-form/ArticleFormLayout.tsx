
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { StepHeader } from "./StepHeader";
import { StepControls } from "./StepControls";
import { UseFormReturn } from "react-hook-form";
import { ArticleFormValues } from "./types";

interface ArticleFormLayoutProps {
  form: UseFormReturn<ArticleFormValues>;
  title: string;
  description: string;
  progress: number;
  children: React.ReactNode;
  error: string | null;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  submitLabel: string;
  canAutoGenerate: boolean;
  isGeneratingContent: boolean;
  onSubmit: (data: ArticleFormValues) => void;
  onPrevious: () => void;
  onNext: () => void;
  onCancel?: () => void;
  onGenerate: () => Promise<void>;
}

export function ArticleFormLayout({
  form,
  title,
  description,
  progress,
  children,
  error,
  isFirstStep,
  isLastStep,
  isLoading,
  submitLabel,
  canAutoGenerate,
  isGeneratingContent,
  onSubmit,
  onPrevious,
  onNext,
  onCancel,
  onGenerate
}: ArticleFormLayoutProps) {
  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="w-full">
            <StepHeader 
              title={title} 
              description={description} 
              progress={progress} 
            />
            
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}
              {children}
            </CardContent>
            
            <StepControls 
              isFirstStep={isFirstStep} 
              isLastStep={isLastStep} 
              isLoading={isLoading} 
              submitLabel={submitLabel}
              canAutoGenerate={canAutoGenerate}
              isGeneratingContent={isGeneratingContent}
              onPrevious={onPrevious}
              onNext={onNext}
              onCancel={onCancel}
              onGenerate={onGenerate}
            />
          </Card>
        </form>
      </Form>
    </div>
  );
}
