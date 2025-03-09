
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useSEOGeneration } from "../hooks/useSEOGeneration";

interface MetaDescriptionFieldProps {
  form: UseFormReturn<any>;
}

export function MetaDescriptionField({ form }: MetaDescriptionFieldProps) {
  const { generateSEOData } = useSEOGeneration(form);

  return (
    <FormField
      control={form.control}
      name="metaDescription"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex justify-between">
            <span>Meta Description</span>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={generateSEOData}
              className="h-6 px-2 text-xs"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Generate
            </Button>
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
