
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GenerationParams, GeneratedContent } from './types';
import { handleGenerationError, validateGenerationParams } from './errorHandlers';

export async function generateContent(
  params: GenerationParams, 
  retryCount: number = 0, 
  maxRetries: number = 2
): Promise<GeneratedContent | null> {
  // Validate parameters
  if (!validateGenerationParams(params)) {
    return null;
  }

  try {
    const contentDetails = `${params.contentLength} ${params.tone || 'informative'} content (Level ${params.moralLevel})`;
    toast.info(`Generating ${params.contentType} for ${params.platform} (${contentDetails})...`);

    // Call the generate-article edge function
    const { data, error } = await supabase.functions.invoke('generate-article', {
      body: params
    });
    
    if (error) {
      console.error("Error from Supabase function:", error);
      
      // Retry logic
      if (retryCount < maxRetries) {
        toast.warning(`Retrying content generation (Attempt ${retryCount + 1}/${maxRetries})...`);
        return generateContent(params, retryCount + 1, maxRetries);
      }
      
      throw new Error(error.message || 'Failed to generate content');
    }

    if (!data) {
      console.error("No data returned from function");
      
      // Retry logic
      if (retryCount < maxRetries) {
        toast.warning(`Retrying content generation (Attempt ${retryCount + 1}/${maxRetries})...`);
        return generateContent(params, retryCount + 1, maxRetries);
      }
      
      throw new Error('No data returned from content generation');
    }

    if (data.error) {
      console.error("Error in response data:", data.error);
      
      // Retry logic
      if (retryCount < maxRetries) {
        toast.warning(`Retrying content generation (Attempt ${retryCount + 1}/${maxRetries})...`);
        return generateContent(params, retryCount + 1, maxRetries);
      }
      
      throw new Error(data.error || 'Failed to generate content');
    }

    console.log("Generated content response:", data);

    // Validate the response data
    if (!data.content || typeof data.content !== 'string') {
      throw new Error('Invalid content returned from generation');
    }

    // Format and return the content
    const content = {
      title: data.title || params.theme || 'Generated Content',
      content: data.content || '',
      metaDescription: data.metaDescription || '',
      keywords: data.keywords || []
    };
    
    // Show detailed success message
    const successMessage = `${params.contentType} for ${params.platform} generated successfully!`;
    toast.success(successMessage);
    
    return content;
  } catch (error) {
    handleGenerationError(error);
    return null;
  }
}
