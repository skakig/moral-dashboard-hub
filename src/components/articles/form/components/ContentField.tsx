
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";

interface ContentFieldProps {
  form: UseFormReturn<any>;
  isGenerating?: boolean;
  onGenerate?: () => void;
}

export function ContentField({ form, isGenerating = false, onGenerate }: ContentFieldProps) {
  const handleCopy = () => {
    const content = form.getValues('content');
    if (content) {
      navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard");
    } else {
      toast.error("No content to copy");
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
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleCopy}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
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
