
import { useState, useCallback } from 'react';
import { GenerationParams, GeneratedContent } from './ai-generation/types';
import { debounce } from './ai-generation/debounceUtils';
import { generateKeywords as generateKeywordsUtil } from './ai-generation/keywordUtils';
import { generateContent as generateContentUtil } from './ai-generation/contentGenerator';

export function useAIGeneration() {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const generateContent = async (params: GenerationParams) => {
    setLoading(true);
    setGenerationProgress(10); // Start progress
    
    try {
      setGenerationProgress(25); // Update progress
      
      const content = await generateContentUtil(params, retryCount, MAX_RETRIES);
      
      setGenerationProgress(90); // Almost done
      
      // Reset retry count on success
      setRetryCount(0);
      
      if (content) {
        setGeneratedContent(content);
        setGenerationProgress(100); // Done
      }
      
      return content;
    } catch (error) {
      setGenerationProgress(0); // Reset progress on error
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a debounced version of generateContent
  const debouncedGenerate = useCallback(
    debounce((params: GenerationParams) => generateContent(params), 1000),
    []
  );

  // Generate SEO keywords based on theme, platform, and content type
  const generateKeywords = async (theme: string, platform: string, contentType: string) => {
    return generateKeywordsUtil(theme, platform, contentType);
  };

  const resetGeneratedContent = () => setGeneratedContent(null);

  return {
    loading,
    generatedContent,
    generateContent,
    debouncedGenerate,
    generateKeywords,
    resetGeneratedContent,
    generationProgress
  };
}
