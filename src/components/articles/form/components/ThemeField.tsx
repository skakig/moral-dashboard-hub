
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ArticleFormValues } from "../step-form/types";

interface ThemeFieldProps {
  form: UseFormReturn<ArticleFormValues>;
  onGenerate?: () => Promise<void>;
  autoGenerate?: boolean;
}

export function ThemeField({ form, onGenerate, autoGenerate }: ThemeFieldProps) {
  const { register, watch } = form;
  const theme = watch("theme");

  return (
    <div className="space-y-2">
      <div className="grid gap-2">
        <label htmlFor="theme" className="text-sm font-medium">
          Theme/Topic
        </label>
        <textarea
          id="theme"
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter a theme or description of what you want to generate..."
          {...register("theme")}
        />
        <p className="text-xs text-muted-foreground">
          Describe the content you want to create. Be specific for better results.
        </p>
      </div>
    </div>
  );
}
