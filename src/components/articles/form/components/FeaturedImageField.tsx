
import React, { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, Copy } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useImageGeneration } from "../hooks/useImageGeneration";
import { toast } from "sonner";

interface FeaturedImageFieldProps {
  form: UseFormReturn<any>;
}

export function FeaturedImageField({ form }: FeaturedImageFieldProps) {
  const { generateImage, loading } = useImageGeneration();
  const [generating, setGenerating] = useState(false);

  const handleGenerateImage = async () => {
    setGenerating(true);
    const theme = form.getValues("theme") || form.getValues("title") || "Featured image";
    const result = await generateImage(theme);
    if (result) {
      form.setValue("featuredImage", result, { shouldDirty: true });
      form.trigger("featuredImage");
    }
    setGenerating(false);
  };

  const handleCopy = () => {
    const value = form.getValues("featuredImage");
    if (value) {
      navigator.clipboard.writeText(value);
      toast.success("Image URL copied to clipboard");
    } else {
      toast.error("No image URL to copy");
    }
  };

  return (
    <FormField
      control={form.control}
      name="featuredImage"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex justify-between">
            <span>Featured Image URL</span>
          </FormLabel>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.jpg"
                  {...field}
                  className="flex-1"
                />
              </FormControl>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                className="whitespace-nowrap"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy URL
              </Button>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGenerateImage}
              disabled={generating || loading}
              className="w-full"
            >
              {generating || loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Image with AI
                </>
              )}
            </Button>
          </div>
          <FormMessage />
          {field.value && (
            <div className="mt-2 border rounded-md overflow-hidden">
              <img 
                src={field.value} 
                alt="Featured" 
                className="w-full h-40 object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
