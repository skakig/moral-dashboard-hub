
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { EdgeFunctionService } from '@/services/api/edgeFunctions';
import { GenerationParams, GeneratedContent } from './ai-generation/types';

export function useAIGeneration() {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateContent = useCallback(async (params: GenerationParams): Promise<GeneratedContent> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await EdgeFunctionService.generateContent(params);
      
      if (!result || !result.content) {
        throw new Error('Failed to generate content. Please try again.');
      }
      
      const content: GeneratedContent = {
        title: result.title || params.theme || '',
        content: result.content,
        metaDescription: result.metaDescription || '',
        keywords: result.keywords || [],
      };
      
      setGeneratedContent(content);
      return content;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate content';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fix the parameter order in generateKeywords method
  const generateKeywords = useCallback(async (theme: string, platform: string, contentType: string): Promise<string[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the edge function to generate keywords
      // Fixed: Pass theme as the first parameter, as expected by the function
      const result = await EdgeFunctionService.generateSEOData(theme, '');
      
      if (!result || !result.keywords) {
        throw new Error('Failed to generate keywords. Please try again.');
      }
      
      return result.keywords;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate keywords';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const resetGeneratedContent = useCallback(() => {
    setGeneratedContent(null);
  }, []);

  return {
    loading,
    generatedContent,
    generateContent,
    generateKeywords,
    resetGeneratedContent,
    error
  };
}
