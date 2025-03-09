
import React from "react";
import { ContentField } from "./ContentField";
import { ThemeField } from "./ThemeField";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UseFormReturn } from "react-hook-form";

interface ArticleContentSectionProps {
  form: UseFormReturn<any>;
  error: string | null;
  isGeneratingContent: boolean;
  handleGenerateContent: () => Promise<void>;
}

export function ArticleContentSection({ 
  form, 
  error, 
  isGeneratingContent, 
  handleGenerateContent 
}: ArticleContentSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Article Content</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Enter your article content below or use AI to generate content based on your settings.
        The content should align with The Moral Hierarchy principles at level {form.watch("moralLevel") || "5"}.
      </p>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <Separator className="mb-4" />
      
      {/* Add the ThemeField component before ContentField with the generate handler */}
      <div className="mb-4">
        <ThemeField form={form} onGenerate={handleGenerateContent} />
      </div>
      
      <ContentField 
        form={form} 
        isGenerating={isGeneratingContent} 
        onGenerate={handleGenerateContent}
      />
    </div>
  );
}
