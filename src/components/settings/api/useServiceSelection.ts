
import { useState } from 'react';

// Define suggested services by category
export const SUGGESTED_SERVICES = {
  "Text Generation": ["OpenAI", "Anthropic", "Mistral AI"],
  "Voice Generation": ["ElevenLabs", "OpenAI TTS"],
  "Image Generation": ["Stable Diffusion", "DALL-E"],
  "Video Generation": ["RunwayML", "Pika Labs"],
  "Social Media": ["Meta API", "TikTok API", "YouTube API", "Twitter/X API"]
};

interface UseServiceSelectionProps {
  category: string;
}

export function useServiceSelection({ category }: UseServiceSelectionProps) {
  const [serviceName, setServiceName] = useState<string>('');
  
  const needsBaseUrl = serviceName?.toLowerCase().includes('runway') || 
                      serviceName?.toLowerCase().includes('custom') ||
                      serviceName?.toLowerCase().includes('meta') ||
                      serviceName?.toLowerCase().includes('tiktok');

  const getTestKey = () => {
    // This provides a test key format for demo purposes
    if (!serviceName) return '';
    return `TEST_${serviceName.toUpperCase().replace(/\s+/g, '_')}_KEY_123`;
  };

  const suggestedServices = SUGGESTED_SERVICES[category as keyof typeof SUGGESTED_SERVICES] || [];

  return {
    serviceName,
    setServiceName,
    needsBaseUrl,
    getTestKey,
    suggestedServices
  };
}
