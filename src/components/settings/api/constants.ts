
export const API_CATEGORIES = {
  "Text Generation": ["OpenAI", "Anthropic", "Mistral AI", "Claude", "Meta Llama", "Google Gemini", "Custom Text AI"],
  "Voice Generation": ["ElevenLabs", "OpenAI TTS", "PlayHT", "Murf AI", "Custom Voice AI"],
  "Image Generation": ["Stable Diffusion", "DALL-E", "Midjourney API", "Leonardo AI", "Custom Image AI"],
  "Video Generation": ["RunwayML", "Pika Labs", "Synthesia", "D-ID", "Custom Video AI"],
  "Social Media": ["Meta API", "Instagram API", "Facebook API", "TikTok API", "YouTube API", "Twitter/X API", "LinkedIn API", "Custom Social API"],
  "Custom": ["Custom API Service"]
};

// Helper functions for determining service properties
export function needsBaseUrlForService(serviceName: string): boolean {
  const serviceNameLower = serviceName?.toLowerCase() || '';
  return serviceNameLower.includes('custom') || 
         serviceNameLower.includes('runway') ||
         serviceNameLower.includes('meta') ||
         serviceNameLower.includes('tiktok');
}

export function getTestKeyForService(serviceName: string): string {
  if (!serviceName) return '';
  return `TEST_${serviceName.toUpperCase().replace(/\s+/g, '_')}_KEY_123`;
}

export function getCategoryForService(serviceName: string): string {
  const serviceNameLower = serviceName?.toLowerCase() || '';
  
  for (const [category, services] of Object.entries(API_CATEGORIES)) {
    if (services.some(s => serviceNameLower.includes(s.toLowerCase()))) {
      return category;
    }
  }
  
  if (serviceNameLower.includes('custom')) {
    return 'Custom';
  }
  
  return 'Other';
}
