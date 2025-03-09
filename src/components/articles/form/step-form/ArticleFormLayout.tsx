
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { StepControls } from "./StepControls";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ArticleFormLayoutProps {
  form: UseFormReturn<any>;
  title: string;
  description: string;
  children: React.ReactNode; // This is important!
  error?: string | null;
  progress?: number;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
  submitLabel?: string;
  canAutoGenerate?: boolean;
  isGeneratingContent?: boolean;
  onSubmit: (data: any) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onCancel?: () => void;
  onGenerate?: () => void;
  nextStepTitle?: string | null;
}

export function ArticleFormLayout({
  form,
  title,
  description,
  children,
  error,
  progress = 0,
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
  submitLabel = "Create",
  canAutoGenerate = false,
  isGeneratingContent = false,
  onSubmit,
  onPrevious,
  onNext,
  onCancel,
  onGenerate,
  nextStepTitle,
}: ArticleFormLayoutProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full">
          <CardHeader className="flex flex-col gap-4">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Progress value={progress} className="h-2 w-full" />
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
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
            nextStepTitle={nextStepTitle || undefined}
          />
        </Card>
      </form>
    </Form>
  );
}
