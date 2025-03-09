
import React, { useState, useEffect, useRef } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wand2, Loader2, Copy, RefreshCw, Upload, AlertTriangle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useImageGeneration } from "../hooks/useImageGeneration";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FeaturedImageFieldProps {
  form: UseFormReturn<any>;
}

export function FeaturedImageField({ form }: FeaturedImageFieldProps) {
  const { generateImage, loading } = useImageGeneration();
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setError(null);
    
    try {
      // Use theme or title as prompt
      const theme = form.getValues("theme") || form.getValues("title") || "Featured image";
      
      // Include content excerpt for better context
      const content = form.getValues("content");
      let contentSummary = "";
      
      if (content && content.length > 0) {
        // Take just the first 100 characters to give some context
        contentSummary = content.substring(0, 100);
      }
      
      const prompt = `${theme}${contentSummary ? ". Content summary: " + contentSummary : ""}`;
      
      // Generate image
      const result = await generateImage(prompt);
      
      if (result) {
        form.setValue("featuredImage", result, { shouldDirty: true });
        form.trigger("featuredImage");
        toast.success("Image generated successfully");
      } else {
        throw new Error("Image generation failed - no result returned");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      setError(error.message || "Failed to generate image");
      toast.error("Failed to generate image: " + (error.message || "Unknown error"));
    } finally {
      setGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    
    try {
      // Convert the file to a data URL
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          form.setValue("featuredImage", dataUrl, { shouldDirty: true });
          form.trigger("featuredImage");
          toast.success("Image uploaded successfully");
        }
      };
      
      reader.onerror = () => {
        toast.error("Failed to read the image file");
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

            {error && (
              <Alert variant="destructive" className="mb-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGenerateImage}
                      className="mr-2"
                    >
                      Retry Generation
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => window.open('https://supabase.com/dashboard/project/czljqsxnuylmmfrscski/functions/generate-image/logs', '_blank')}
                          >
                            View Logs
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View edge function logs to troubleshoot</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGenerateImage}
                disabled={generating || loading}
              >
                {generating || loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : field.value ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Image
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                onClick={triggerFileInput}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
                accept="image/*"
              />
            </div>
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
