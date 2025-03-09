
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useImageGeneration } from "../hooks/useImageGeneration";

interface FeaturedImageFieldProps {
  form: UseFormReturn<any>;
}

export function FeaturedImageField({ form }: FeaturedImageFieldProps) {
  const { generateImage } = useImageGeneration(form);

  return (
    <FormField
      control={form.control}
      name="featuredImageUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex justify-between">
            <span>Featured Image URL</span>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={generateImage}
              className="h-6 px-2 text-xs"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Generate Image
            </Button>
          </FormLabel>
          <FormControl>
            <div className="flex space-x-2">
              <Input 
                placeholder="https://example.com/image.jpg"
                {...field}
                className="flex-1"
              />
            </div>
          </FormControl>
          <FormMessage />
          {field.value && (
            <div className="mt-2 border rounded-md overflow-hidden">
              <img 
                src={field.value} 
                alt="Featured" 
                className="w-full h-40 object-cover" 
              />
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
