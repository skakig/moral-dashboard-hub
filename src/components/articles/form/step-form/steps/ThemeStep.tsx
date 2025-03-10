
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ThemeField } from "../../components/ThemeField";
import { ArticleFormValues } from "../../StepByStepArticleForm";

interface ThemeStepProps {
  form: UseFormReturn<ArticleFormValues>;
  onGenerate: () => Promise<void>;
  autoGenerate: boolean;
  setAutoGenerate: (value: boolean) => void;
}

export function ThemeStep({ form, onGenerate, autoGenerate, setAutoGenerate }: ThemeStepProps) {
  return (
    <div className="space-y-4">
      <ThemeField form={form} onGenerate={onGenerate} autoGenerate={autoGenerate} />
      
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          id="autoGenerate"
          checked={autoGenerate}
          onChange={(e) => setAutoGenerate(e.target.checked)}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="autoGenerate" className="text-sm">
          Auto-generate content when I finish typing
        </label>
      </div>
    </div>
  );
}
