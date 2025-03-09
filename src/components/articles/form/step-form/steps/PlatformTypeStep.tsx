
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ContentTypeFields } from "../../components/ContentTypeFields";
import { ArticleFormValues } from "../../StepByStepArticleForm";

interface PlatformTypeStepProps {
  form: UseFormReturn<ArticleFormValues>;
}

export function PlatformTypeStep({ form }: PlatformTypeStepProps) {
  return (
    <div className="space-y-4">
      <ContentTypeFields 
        form={form} 
        platform={form.watch("platform")} 
        setContentType={(value) => form.setValue("contentType", value)} 
        setPlatform={(value) => form.setValue("platform", value)} 
      />
    </div>
  );
}
