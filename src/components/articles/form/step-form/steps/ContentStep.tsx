
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ContentField } from "../../components/ContentField";
import { ArticleFormValues } from "../../StepByStepArticleForm";
import { RefreshCw } from "lucide-react";

interface ContentStepProps {
  form: UseFormReturn<ArticleFormValues>;
  isGenerating: boolean;
  onGenerate: () => Promise<void>;
}

export function ContentStep({ form, isGenerating, onGenerate }: ContentStepProps) {
  return (
    <div className="space-y-4">
      <ContentField 
        form={form} 
        isGenerating={isGenerating} 
        onGenerate={onGenerate} 
      />
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={onGenerate}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Revise Content
        </Button>
      </div>
    </div>
  );
}
