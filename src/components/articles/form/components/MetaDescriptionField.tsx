
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2, Copy } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useSEOGeneration } from "../hooks/useSEOGeneration";
import { toast } from "sonner";

interface MetaDescriptionFieldProps {
  form: UseFormReturn<any>;
}

export function MetaDescriptionField({ form }: MetaDescriptionFieldProps) {
  const { generateSEOData } = useSEOGeneration(form);

  const handleCopy = () => {
    const metaDescription = form.getValues('metaDescription');
    if (metaDescription) {
      navigator.clipboard.writeText(metaDescription);
      toast.success("Meta description copied to clipboard");
    } else {
      toast.error("No meta description to copy");
    }
  };

  return (
    <FormField
      control={form.control}
      name="metaDescription"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex justify-between items-center">
            <span>Meta Description</span>
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs flex items-center gap-1"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3" />
                Copy
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={generateSEOData}
                className="h-6 px-2 text-xs flex items-center gap-1"
              >
                <Wand2 className="h-3 w-3" />
                Generate
              </Button>
            </div>
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="SEO meta description"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
