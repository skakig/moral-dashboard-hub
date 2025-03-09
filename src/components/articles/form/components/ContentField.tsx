
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, Copy } from "lucide-react";
import { toast } from "sonner";

interface ContentFieldProps {
  form: any;
  isGenerating?: boolean;
  onGenerate?: () => void;
}

export function ContentField({ form, isGenerating = false, onGenerate }: ContentFieldProps) {
  // Function to copy content to clipboard
  const handleCopyContent = () => {
    const content = form.getValues("content");
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
          <div className="flex justify-between items-center">
            <FormLabel>Content</FormLabel>
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs flex items-center gap-1"
                onClick={handleCopyContent}
              >
                <Copy className="h-3 w-3" />
                Copy Content
              </Button>
              {onGenerate && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="h-6 px-2 text-xs flex items-center gap-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3" />
                      Generate
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          <FormControl>
            <Textarea
              placeholder="Enter your content here or use AI to generate it"
              className="min-h-[300px] font-mono"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
