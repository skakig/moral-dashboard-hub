
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";

interface ContentFieldProps {
  form: UseFormReturn<any>;
  isGenerating?: boolean;
  onGenerate?: () => void;
}

export function ContentField({ form, isGenerating = false, onGenerate }: ContentFieldProps) {
  return (
    <FormField
      control={form.control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between mb-2">
            <FormLabel>Content</FormLabel>
            {onGenerate && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={onGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
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
            )}
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
