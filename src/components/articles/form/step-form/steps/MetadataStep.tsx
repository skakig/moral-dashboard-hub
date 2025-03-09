
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { ArticleFormValues } from "../../StepByStepArticleForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MetadataStepProps {
  form: UseFormReturn<ArticleFormValues>;
  onNext?: () => void;
  onBack?: () => void;
}

export function MetadataStep({ form, onNext, onBack }: MetadataStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSEOData = async () => {
    try {
      setIsGenerating(true);
      
      const content = form.getValues("content") || "";
      const theme = form.getValues("theme") || "";
      const platform = form.getValues("platform") || "general";
      const contentType = form.getValues("contentType") || "article";
      
      if (!content && !theme) {
        toast.error("Please enter content or theme first");
        setIsGenerating(false);
        return;
      }
      
      toast.info("Generating SEO data...");
      
      // Call the edge function to generate SEO data
      const { data, error } = await supabase.functions.invoke("generate-seo-data", {
        body: { content, theme, platform, contentType }
      });
      
      if (error) throw error;
      
      if (!data) {
        throw new Error("No data returned from SEO generation");
      }
      
      // Update form fields with generated data
      form.setValue("metaDescription", data.metaDescription || "", { shouldDirty: true });
      form.setValue("seoKeywords", Array.isArray(data.keywords) ? data.keywords.join(", ") : "", { shouldDirty: true });
      
      toast.success("SEO data generated successfully!");
    } catch (error) {
      console.error("Error generating SEO data:", error);
      toast.error("Failed to generate SEO data");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">SEO Metadata</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateSEOData}
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
              Generate SEO Data
            </>
          )}
        </Button>
      </div>

      <FormField
        control={form.control}
        name="metaDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief description for search engines..."
                className="min-h-24"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="seoKeywords"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Keywords (comma separated)</FormLabel>
            <FormControl>
              <Input
                placeholder="moral hierarchy, ethics, personal growth, etc."
                {...field}
              />
            </FormControl>
            <FormMessage />
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
              Next: Voice Content
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
