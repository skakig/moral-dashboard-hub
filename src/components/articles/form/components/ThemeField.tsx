
import React, { KeyboardEvent, useEffect, useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface ThemeFieldProps {
  form: UseFormReturn<any>;
  onGenerate?: () => void;
}

export function ThemeField({ form, onGenerate }: ThemeFieldProps) {
  const [placeholder, setPlaceholder] = useState("e.g., Create a YouTube script comparing Calvin & Hobbes to The Far Side and explain where each falls in TMH");
  
  // Update the placeholder based on platform and content type selections
  useEffect(() => {
    const platform = form.watch("platform");
    const contentType = form.watch("contentType");
    const moralLevel = form.watch("moralLevel") || 5;
    const tone = form.watch("tone") || "informative";
    
    if (platform && contentType) {
      // Create mapping keys for different platform and content type combinations
      const platformKey = platform.replace(/\s+/g, '');
      const contentTypeKey = contentType.replace(/\s+/g, '');
      const keyMapper = `${platformKey}_${contentTypeKey}`;
      
      const placeholders = {
        // YouTube placeholders
        "YouTube_youtube_script": `e.g., Create a ${tone} YouTube script about moral development in everyday decisions at level ${moralLevel}`,
        "YouTube_youtube_shorts": `e.g., Create a short, engaging ${tone} YouTube Shorts script about a quick moral dilemma at level ${moralLevel}`,
        "YouTube_youtube_description": `e.g., Write a compelling ${tone} YouTube description for a video about The Moral Hierarchy level ${moralLevel}`,
        
        // Instagram placeholders
        "Instagram_carousel": `e.g., Create a ${tone} 7-slide Instagram carousel about ethical decision making at level ${moralLevel}`,
        "Instagram_reels_script": `e.g., Create a ${tone} script for an Instagram Reel explaining the key aspects of moral level ${moralLevel}`,
        "Instagram_social_media": `e.g., Create a ${tone} Instagram post about how to recognize moral level ${moralLevel} in daily life`,
        
        // Twitter/X placeholders
        "Twitter_tweet_thread": `e.g., Write a ${tone} Twitter thread (5-7 tweets) explaining moral level ${moralLevel} with examples`,
        "Twitter_social_media": `e.g., Create a ${tone} Twitter post with hashtags about moral growth at level ${moralLevel}`,
        
        // LinkedIn placeholders
        "LinkedIn_article": `e.g., Write a professional ${tone} LinkedIn article about applying level ${moralLevel} morality in business leadership`,
        "LinkedIn_social_media": `e.g., Create a ${tone} LinkedIn post about ethical decision-making in the workplace at level ${moralLevel}`,
        
        // TikTok placeholders
        "TikTok_social_media": `e.g., Create a ${tone} TikTok script explaining moral level ${moralLevel} in an entertaining way`,
        "TikTok_script": `e.g., Write a ${tone} 30-second TikTok script about a moral dilemma at level ${moralLevel}`,
        
        // Website placeholders
        "Website_article": `e.g., Write a comprehensive ${tone} article about moral development at level ${moralLevel}`,
        "Website_blog_post": `e.g., Create a ${tone} blog post discussing the transition between moral levels ${moralLevel-1 > 0 ? moralLevel-1 : 1} and ${moralLevel}`,
        
        // Facebook placeholders
        "Facebook_social_media": `e.g., Write a ${tone} Facebook post about recognizing moral level ${moralLevel} thinking in everyday situations`
      };
      
      // Try first for the exact match
      if (placeholders[keyMapper]) {
        setPlaceholder(placeholders[keyMapper]);
      } else {
        // Try for a more generic platform match
        const platformMatches = Object.keys(placeholders).filter(key => key.startsWith(`${platformKey}_`));
        if (platformMatches.length > 0) {
          setPlaceholder(placeholders[platformMatches[0]]);
        } else {
          // Default fallback based on platform
          setPlaceholder(`e.g., Create ${tone} ${contentType.replace(/_/g, ' ')} content for ${platform} about The Moral Hierarchy level ${moralLevel}`);
        }
      }
    }
  }, [form.watch("platform"), form.watch("contentType"), form.watch("moralLevel"), form.watch("tone")]);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter is pressed without Shift key (for new line), generate content
    if (e.key === 'Enter' && !e.shiftKey && onGenerate) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <FormField
      control={form.control}
      name="theme"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between mb-2">
            <FormLabel>Describe what you want to generate</FormLabel>
            {onGenerate && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={onGenerate}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Generate
              </Button>
            )}
          </div>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="resize-none"
              onKeyDown={handleKeyDown}
              {...field}
            />
          </FormControl>
          <div className="text-xs text-muted-foreground mt-1">
            Press Enter to generate content or use the Generate button
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
