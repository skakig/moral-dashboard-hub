
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ArticleFormValues } from "../../StepByStepArticleForm";

interface ContentStepProps {
  form: UseFormReturn<ArticleFormValues>;
  isGenerating: boolean;
  onGenerate: () => Promise<void>;
  onNext?: () => void;
  onBack?: () => void;
}

export function ContentStep({ 
  form, 
  isGenerating, 
  onGenerate,
  onNext,
  onBack
}: ContentStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <FormLabel className="text-base">Article Content</FormLabel>
        <Button
          type="button"
          variant="outline"
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Content
            </>
          )}
        </Button>
      </div>

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                placeholder="Your article content..."
                className="min-h-48 font-mono"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Navigation Buttons */}
      {(onNext || onBack) && (
        <div className="flex justify-between mt-8">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Previous
            </Button>
          )}
          {onNext && (
            <Button onClick={onNext}>
              Next: SEO & Metadata
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
