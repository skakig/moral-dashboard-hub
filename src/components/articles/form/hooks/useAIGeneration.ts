
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

    setLoading(true);
    try {
      toast.info(`Generating ${params.contentType} with AI...`);

      console.log("Calling generate-article with params:", params);

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

      console.log("Generated content response:", data);

      // Set the generated content in the state
      const content = {
        title: data.title || '',
        content: data.content || '',
        metaDescription: data.metaDescription || '',
        keywords: data.keywords || []
      };
      
      setGeneratedContent(content);
      toast.success('Content generated successfully!');
      return content;
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        return [];
      }

      return data?.keywords || [];
    } catch (error) {
      console.error("Error generating keywords:", error);
      return [];
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
