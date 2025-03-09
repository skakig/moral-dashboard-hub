
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { MetaDescriptionField } from "./MetaDescriptionField";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

interface SEOSectionProps {
  form: UseFormReturn<any>;
}

export function SEOSection({ form }: SEOSectionProps) {
  const handleCopyField = (fieldName: string, successMessage: string) => {
    const value = form.getValues(fieldName);
    if (value) {
      navigator.clipboard.writeText(String(value));
      toast.success(successMessage);
    } else {
      toast.error(`No ${fieldName} to copy`);
    }
  };

  return (
    <div className="space-y-4">
      <MetaDescriptionField form={form} />
      
      <FormField
        control={form.control}
        name="seoKeywords"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center">
              <FormLabel>Keywords (comma separated)</FormLabel>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs flex items-center gap-1"
                onClick={() => handleCopyField('seoKeywords', 'Keywords copied to clipboard')}
              >
                <Copy className="h-3 w-3" />
                Copy
              </Button>
            </div>
            <FormControl>
              <Textarea
                placeholder="Enter SEO keywords, separated by commas"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
