
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GenerationParams {
  theme: string;
  keywords: string[];
  contentType: string;
  moralLevel: number;
  platform: string;
  contentLength: string;
}

interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
}

export function useAIGeneration() {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const generateContent = async (params: GenerationParams) => {
    if (!params.theme && (!params.keywords || !params.keywords.length)) {
      toast.error('Please enter a theme or keywords');
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
        throw new Error('No data returned from content generation');
      }

      console.log("Generated content response:", data);

      // Set the generated content in the state
      const content = {
        title: data.title || '',
        content: data.content || '',
        metaDescription: data.metaDescription || ''
      };
      
      setGeneratedContent(content);
      return content;
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetGeneratedContent = () => setGeneratedContent(null);

  return {
    loading,
    generatedContent,
    generateContent,
    resetGeneratedContent
  };
}
