
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ThemeField } from "../../../components/ThemeField";
import { ArticleFormValues } from "../types";
import { AutoGenerateOptions } from "../hooks/useAutoGenerateOptions";

interface ThemeStepProps {
  form: UseFormReturn<ArticleFormValues>;
  onGenerate: () => Promise<void>;
  autoGenerate: boolean;
  setAutoGenerate: (value: boolean) => void;
  autoGenerateOptions?: AutoGenerateOptions;
  setAutoGenerateOptions?: (options: Partial<AutoGenerateOptions>) => void;
}

export function ThemeStep({ 
  form, 
  onGenerate, 
  autoGenerate, 
  setAutoGenerate,
  autoGenerateOptions,
  setAutoGenerateOptions
}: ThemeStepProps) {
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

      {autoGenerateOptions && setAutoGenerateOptions && autoGenerate && (
        <div className="space-y-2 pl-6 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoGenerateVoice"
              checked={autoGenerateOptions.voice}
              onChange={(e) => setAutoGenerateOptions({
                voice: e.target.checked
              })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="autoGenerateVoice" className="text-sm">
              Also generate voice content
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoGenerateImage"
              checked={autoGenerateOptions.image}
              onChange={(e) => setAutoGenerateOptions({
                image: e.target.checked
              })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="autoGenerateImage" className="text-sm">
              Also generate featured image
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
