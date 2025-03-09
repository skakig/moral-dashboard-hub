
import { toast } from 'sonner';

export function handleGenerationError(error: unknown): string {
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
  return errorMessage;
}

export function validateGenerationParams(params: { 
  theme?: string; 
  platform?: string; 
  contentType?: string;
}): boolean {
  if (!params.theme) {
    toast.error('Please enter a theme or description of what you want to generate');
    return false;
  }

  if (!params.platform) {
    toast.error('Please select a platform');
    return false;
  }

  if (!params.contentType) {
    toast.error('Please select a content type');
    return false;
  }

  return true;
}
