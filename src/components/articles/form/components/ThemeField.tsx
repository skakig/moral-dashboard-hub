
import React, { KeyboardEvent } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface ThemeFieldProps {
  form: UseFormReturn<any>;
  onGenerate?: () => void;
}

export function ThemeField({ form, onGenerate }: ThemeFieldProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter is pressed without Shift key (for new line), generate content
    if (e.key === 'Enter' && !e.shiftKey && onGenerate) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <FormField
      control={form.control}
      name="theme"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between mb-2">
            <FormLabel>Describe what you want to generate</FormLabel>
            {onGenerate && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={onGenerate}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Generate
              </Button>
            )}
          </div>
          <FormControl>
            <Textarea
              placeholder="e.g., Create a YouTube script comparing Calvin & Hobbes to The Far Side and explain where each falls in TMH"
              className="resize-none"
              onKeyDown={handleKeyDown}
              {...field}
            />
          </FormControl>
          <div className="text-xs text-muted-foreground mt-1">
            Press Enter to generate content or use the Generate button
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
