
import React, { useState, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, Copy, RefreshCw } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useImageGeneration } from "../hooks/useImageGeneration";
import { toast } from "sonner";

interface FeaturedImageFieldProps {
  form: UseFormReturn<any>;
}

export function FeaturedImageField({ form }: FeaturedImageFieldProps) {
  const { generateImage, loading } = useImageGeneration();
  const [generating, setGenerating] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number; label: string }>({ 
    width: 1200, 
    height: 630, 
    label: "Custom" 
  });
  
  // Update image dimensions when platform changes
  useEffect(() => {
    const platform = form.watch("platform");
    if (platform) {
      updateDimensionsForPlatform(platform);
    }
  }, [form.watch("platform")]);
  
  const updateDimensionsForPlatform = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        setImageDimensions({ width: 1080, height: 1080, label: "Instagram (1:1)" });
        break;
      case 'facebook':
        setImageDimensions({ width: 1200, height: 630, label: "Facebook (1.91:1)" });
        break;
      case 'twitter':
      case 'x':
        setImageDimensions({ width: 1200, height: 675, label: "Twitter (16:9)" });
        break;
      case 'linkedin':
        setImageDimensions({ width: 1200, height: 627, label: "LinkedIn (1.91:1)" });
        break;
      case 'youtube':
        setImageDimensions({ width: 1280, height: 720, label: "YouTube (16:9)" });
        break;
      case 'tiktok':
        setImageDimensions({ width: 1080, height: 1920, label: "TikTok (9:16)" });
        break;
      case 'pinterest':
        setImageDimensions({ width: 1000, height: 1500, label: "Pinterest (2:3)" });
        break;
      default:
        setImageDimensions({ width: 1200, height: 630, label: "Default (1.91:1)" });
    }
  };

  const handleGenerateImage = async () => {
    setGenerating(true);
    
    try {
      // Use theme or title as prompt
      const theme = form.getValues("theme") || form.getValues("title") || "Featured image";
      const platform = form.getValues("platform");
      
      // Include content excerpt for better context
      const content = form.getValues("content");
      let contentSummary = "";
      
      if (content && content.length > 0) {
        // Take just the first 100 characters to give some context
        contentSummary = content.substring(0, 100);
      }
      
      const prompt = `${theme}${contentSummary ? ". Content summary: " + contentSummary : ""}`;
      
      // Generate image with platform dimensions
      const result = await generateImage(prompt, platform);
      
      if (result) {
        form.setValue("featuredImage", result, { shouldDirty: true });
        form.trigger("featuredImage");
        toast.success("Image generated successfully");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setGenerating(false);
    }
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
            <span>Featured Image</span>
            <span className="text-xs text-muted-foreground">
              {imageDimensions.label} - {imageDimensions.width}×{imageDimensions.height}
            </span>
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
              ) : field.value ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Image for {imageDimensions.label}
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
                className="w-full object-cover" 
                style={{
                  aspectRatio: `${imageDimensions.width}/${imageDimensions.height}`,
                  maxHeight: '300px',
                  objectFit: 'cover'
                }}
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
