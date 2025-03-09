
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GenerationParams {
  theme: string;
  keywords?: string[];
  contentType: string;
  moralLevel: number;
  platform: string;
  contentLength: string;
  tone?: string;
}

interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  keywords?: string[];
}

export function useAIGeneration() {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const generateContent = async (params: GenerationParams) => {
    if (!params.theme) {
      toast.error('Please enter a theme or description of what you want to generate');
      return null;
    }

    if (!params.platform) {
      toast.error('Please select a platform');
      return null;
    }

    if (!params.contentType) {
      toast.error('Please select a content type');
      return null;
    }

    setLoading(true);
    try {
      toast.info(`Generating ${params.contentType} for ${params.platform} with AI...`);

      console.log("Calling generate-article with params:", params);
      
      // Create a more detailed generation message based on parameters
      const contentDetails = `${params.contentLength} ${params.tone || 'informative'} content (Level ${params.moralLevel})`;
      toast.info(`Generating ${params.contentType} for ${params.platform} (${contentDetails})...`);

      // Call the generate-article edge function
      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: params
      });
      
      if (error) {
        console.error("Error from Supabase function:", error);
        throw new Error(error.message || 'Failed to generate content');
      }

      if (!data) {
        console.error("No data returned from function");
        throw new Error('No data returned from content generation');
      }

      if (data.error) {
        console.error("Error in response data:", data.error);
        throw new Error(data.error || 'Failed to generate content');
      }

      console.log("Generated content response:", data);

      // Validate the response data
      if (!data.content || typeof data.content !== 'string') {
        throw new Error('Invalid content returned from generation');
      }

      // Set the generated content in the state
      const content = {
        title: data.title || params.theme || 'Generated Content',
        content: data.content || '',
        metaDescription: data.metaDescription || '',
        keywords: data.keywords || []
      };
      
      setGeneratedContent(content);
      
      // Show detailed success message
      const successMessage = `${params.contentType} for ${params.platform} generated successfully!`;
      toast.success(successMessage);
      
      return content;
    } catch (error) {
      console.error('Error generating content:', error);
      
      // Provide more helpful error message based on error type
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check for common error patterns
      if (errorMessage.includes('API key')) {
        errorMessage = 'API key error: Please check that your OpenAI API key is configured correctly.';
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = 'API rate limit reached. Please try again in a few moments.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        errorMessage = 'Request timed out. The content may be too complex or the server is busy.';
      }
      
      toast.error(`Failed to generate content: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generate SEO keywords based on theme, platform, and content type
  const generateKeywords = async (theme: string, platform: string, contentType: string) => {
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
  };

  const resetGeneratedContent = () => setGeneratedContent(null);

  return {
    loading,
    generatedContent,
    generateContent,
    generateKeywords,
    resetGeneratedContent
  };
}

// Fallback function to generate keywords if the API fails
function generateFallbackKeywords(theme: string, platform: string, contentType: string): string[] {
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
