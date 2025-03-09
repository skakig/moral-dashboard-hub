
import { useState, useEffect } from "react";

export interface ContentTypeOption {
  value: string;
  label: string;
}

/**
 * Hook to manage content type options based on selected platform
 */
export function useContentTypeOptions(platform: string) {
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

  return { getContentTypeOptions };
}
