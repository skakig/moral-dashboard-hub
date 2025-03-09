import React, { useState, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

// Keep the existing ArticleFormFields component
export function ArticleFormFields({ form }) {
  const [contentType, setContentType] = useState(form.watch("contentType") || "");
  const [platform, setPlatform] = useState(form.watch("platform") || "");
  const [contentLength, setContentLength] = useState(form.watch("contentLength") || "medium");

  // Preserve form values when selections change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "contentType") setContentType(value.contentType);
      if (name === "platform") setPlatform(value.platform);
      if (name === "contentLength") setContentLength(value.contentLength);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Generate meta description and SEO keywords using AI
  const generateSEOData = async () => {
    try {
      toast.info("Generating SEO data...");
      
      const content = form.getValues("content") || "";
      const theme = form.getValues("theme") || "";
      
      if (!content && !theme) {
        toast.error("Please enter content or theme first");
        return;
      }
      
      // Call the edge function to generate SEO data
      const { data, error } = await supabase.functions.invoke("generate-seo-data", {
        body: { 
          content,
          theme,
          platform: platform || "general",
          contentType: contentType || "article"
        }
      });
      
      if (error) throw error;
      
      // Update form fields with generated data
      form.setValue("metaDescription", data.metaDescription);
      form.setValue("keywords", data.keywords.join(", "));
      
      toast.success("SEO data generated successfully!");
    } catch (error) {
      console.error("Error generating SEO data:", error);
      toast.error("Failed to generate SEO data");
    }
  };

  // Generate featured image using AI
  const generateImage = async () => {
    try {
      toast.info("Generating featured image...");
      
      const theme = form.getValues("theme") || "";
      const content = form.getValues("content") || "";
      
      if (!theme && !content) {
        toast.error("Please enter a theme or content first");
        return;
      }
      
      // Call the edge function to generate an image
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { 
          contentType: "image",
          text: theme || content.substring(0, 100),
          moralLevel: form.getValues("moralLevel") || 5,
          platform: platform || "general"
        }
      });
      
      if (error) throw error;
      
      // Update form with image URL
      form.setValue("featuredImageUrl", data.imageUrl);
      
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    }
  };

  // Generate voice content using ElevenLabs
  const generateVoiceContent = async () => {
    try {
      toast.info("This feature will be implemented soon");
      // Will be implemented once the ElevenLabs API integration is complete
    } catch (error) {
      console.error("Error generating voice content:", error);
      toast.error("Failed to generate voice content");
    }
  };

  // Get content type options based on platform
  const getContentTypeOptions = () => {
    const defaultOptions = [
      { value: "article", label: "Article" },
      { value: "blog_post", label: "Blog Post" }
    ];
    
    const platformSpecificOptions = {
      "Instagram": [
        { value: "social_media", label: "Social Media Post" },
        { value: "carousel", label: "Carousel" },
        { value: "reels_script", label: "Reels Script" }
      ],
      "YouTube": [
        { value: "youtube_script", label: "YouTube Script" },
        { value: "youtube_shorts", label: "YouTube Shorts" },
        { value: "youtube_description", label: "YouTube Description" }
      ],
      "Twitter": [
        { value: "tweet_thread", label: "Tweet Thread" },
        { value: "social_media", label: "Social Media Post" }
      ],
      "Facebook": [
        { value: "social_media", label: "Social Media Post" },
        { value: "group_post", label: "Group Post" }
      ],
      "TikTok": [
        { value: "tiktok_script", label: "TikTok Script" },
        { value: "social_media", label: "Social Media Post" }
      ],
      "LinkedIn": [
        { value: "social_media", label: "Social Media Post" },
        { value: "article", label: "Article" }
      ]
    };
    
    return platform && platformSpecificOptions[platform] 
      ? [...platformSpecificOptions[platform], ...defaultOptions]
      : defaultOptions;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme/Topic</FormLabel>
              <FormControl>
                <Input placeholder="Enter theme or topic..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between">
                <span>Keywords (comma separated)</span>
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
                <Input 
                  placeholder="moral hierarchy, ethics, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setPlatform(value);
                  
                  // Don't reset content type when platform changes
                  // This fixes the bug where content type was being cleared
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setContentType(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getContentTypeOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="contentLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Length</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setContentLength(value);
                }}
                defaultValue={field.value || "medium"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content length" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="short">Short (300-500 words)</SelectItem>
                  <SelectItem value="medium">Medium (1000-1500 words)</SelectItem>
                  <SelectItem value="long">Long (2000-3000 words)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="moralLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Moral Level (1-9)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={9}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= 9) {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content</FormLabel>
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
    </div>
  );
}
