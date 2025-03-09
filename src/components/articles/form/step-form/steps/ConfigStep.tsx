
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ContentConfigFields } from "../../components/ContentConfigFields";
import { ArticleFormValues } from "../../StepByStepArticleForm";

interface ConfigStepProps {
  form: UseFormReturn<ArticleFormValues>;
  setContentLength: (value: string) => void;
}

export function ConfigStep({ form, setContentLength }: ConfigStepProps) {
  return (
    <div className="space-y-4">
      <ContentConfigFields 
        form={form} 
        setContentLength={setContentLength} 
      />
    </div>
  );
}
