
import React, { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { useAIGeneration } from "../hooks/useAIGeneration";
import { toast } from "sonner";

interface ContentFieldProps {
  form: UseFormReturn<any>;
}

export function ContentField({ form }: ContentFieldProps) {
  const { loading, generateContent } = useAIGeneration();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateContent = async () => {
    try {
      setIsGenerating(true);
      
      // Get the current form values to use as input parameters
      const theme = form.getValues("theme") || ""; 
      const contentType = form.getValues("contentType") || "article";
      const moralLevel = form.getValues("moralLevel") || 5;
      const platform = form.getValues("platform") || "";
      const contentLength = form.getValues("contentLength") || "medium";
      const tone = form.getValues("tone") || "informative";
      const keywords = form.getValues("seoKeywords") ? 
        form.getValues("seoKeywords").split(',').map((k: string) => k.trim()) : 
        [];

      if (!theme) {
        toast.error("Please enter a theme or description of what you want to generate");
        setIsGenerating(false);
        return;
      }

      if (!platform) {
        toast.error("Please select a platform");
        setIsGenerating(false);
        return;
      }

      if (!contentType) {
        toast.error("Please select a content type");
        setIsGenerating(false);
        return;
      }

      console.log("Generating content with params:", { 
        theme, keywords, contentType, moralLevel, platform, contentLength, tone 
      });

      // Call the AI generation
      const content = await generateContent({
        theme,
        keywords,
        contentType,
        moralLevel: parseInt(String(moralLevel), 10),
        platform,
        contentLength,
        tone
      });

      if (content) {
        // Update the form values
        form.setValue("content", content.content, { shouldDirty: true });
        
        // Only update title if it's empty or if the current title is the theme
        if (!form.getValues("title") || form.getValues("title") === theme) {
          form.setValue("title", content.title, { shouldDirty: true });
        }
        
        // Update meta description
        if (content.metaDescription) {
          form.setValue("metaDescription", content.metaDescription, { shouldDirty: true });
        }
        
        // Update keywords if they were generated and not already set
        if (content.keywords && content.keywords.length > 0) {
          form.setValue("seoKeywords", content.keywords.join(', '), { shouldDirty: true });
        }
        
        toast.success("Content generated successfully!");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between mb-2">
            <FormLabel>Content</FormLabel>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleGenerateContent}
              disabled={isGenerating || loading}
            >
              {isGenerating || loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
          <FormControl>
            <Textarea
              placeholder="Enter content here..."
              className="min-h-[200px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
