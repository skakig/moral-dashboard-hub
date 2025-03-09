
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FeaturedImageField } from "../../components/FeaturedImageField";
import { ArticleFormValues } from "../../StepByStepArticleForm";

interface FeaturedImageStepProps {
  form: UseFormReturn<ArticleFormValues>;
}

export function FeaturedImageStep({ form }: FeaturedImageStepProps) {
  return (
    <div className="space-y-4">
      <FeaturedImageField form={form} />
    </div>
  );
}
