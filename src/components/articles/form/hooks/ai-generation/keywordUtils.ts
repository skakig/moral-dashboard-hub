
import { supabase } from '@/integrations/supabase/client';

export async function generateKeywords(theme: string, platform: string, contentType: string): Promise<string[]> {
  if (!theme) {
    return [];
  }

  try {
    const { data, error } = await supabase.functions.invoke('generate-seo-data', {
      body: { theme, platform, contentType }
    });

    if (error) {
      console.error("Error generating keywords:", error);
      return generateFallbackKeywords(theme, platform, contentType);
    }

    if (!data || !Array.isArray(data.keywords)) {
      console.error("Invalid keywords data:", data);
      return generateFallbackKeywords(theme, platform, contentType);
    }

    return data.keywords || [];
  } catch (error) {
    console.error("Error generating keywords:", error);
    return generateFallbackKeywords(theme, platform, contentType);
  }
}

// Fallback function to generate keywords if the API fails
export function generateFallbackKeywords(theme: string, platform: string, contentType: string): string[] {
  // Extract keywords from the theme
  const themeWords = theme.split(/\s+/).filter(word => word.length > 3);
  const themeKeywords = themeWords.slice(0, 3).map(word => '#' + word.replace(/[^a-zA-Z0-9]/g, ''));
  
  // Add platform and content type hashtags
  const platformTag = platform ? [`#${platform.replace(/\s+/g, '')}`] : [];
  const contentTypeTag = contentType ? [`#${contentType.replace(/\s+/g, '').replace(/_/g, '')}`] : [];
  
  // Add some generic TMH hashtags
  const tmhTags = ['#MoralHierarchy', '#Ethics', '#Morality', '#Wisdom', '#PersonalGrowth'];
  
  // Combine all tags and ensure uniqueness
  const allTags = [...themeKeywords, ...platformTag, ...contentTypeTag, ...tmhTags];
  const uniqueTags = [...new Set(allTags)];
  
  return uniqueTags.slice(0, 10); // Return at most 10 tags
}
