
// API Categories and related constants
export const API_CATEGORIES = {
  "Text Generation": [
    "OpenAI",
    "Claude",
    "Anthropic",
    "Google AI Studio",
    "Mistral",
    "Gemini",
    "Custom Text Generation"
  ],
  "Image Generation": [
    "DALL-E",
    "Midjourney",
    "Stable Diffusion",
    "Leonardo.ai",
    "Adobe Firefly",
    "Custom Image Generation"
  ],
  "Video Generation": [
    "Runway",
    "Pika Labs",
    "Synthesia",
    "D-ID",
    "Custom Video Generation"
  ],
  "Audio Generation": [
    "ElevenLabs",
    "Play.ht",
    "Resemble.ai",
    "Descript",
    "Custom Audio Generation"
  ],
  "Social Media": [
    "Facebook",
    "Instagram",
    "Twitter",
    "LinkedIn",
    "TikTok",
    "YouTube",
    "Pinterest",
    "Custom Social Media"
  ],
  "CRM & Analytics": [
    "Hubspot",
    "Salesforce",
    "Google Analytics",
    "Custom CRM"
  ],
  "Other": [
    "Custom API"
  ]
};

// Helper functions for API key management
export const needsBaseUrlForService = (serviceName: string): boolean => {
  if (!serviceName) return false;
  
  const serviceNameLower = serviceName.toLowerCase();
  
  // Services that definitely need a base URL
  if (
    serviceNameLower.includes('custom') || 
    serviceNameLower.includes('runway') ||
    serviceNameLower.includes('replicate') ||
    serviceNameLower.includes('salesforce') ||
    serviceNameLower.includes('hubspot')
  ) {
    return true;
  }
  
  return false;
};

export const getTestKeyForService = (serviceName: string): string => {
  if (!serviceName) return 'TEST_api_key';
  
  const serviceNameLower = serviceName.toLowerCase();
  
  // Generate service-specific test keys
  if (serviceNameLower.includes('openai')) {
    return 'TEST_sk-openai-key';
  } else if (serviceNameLower.includes('elevenlabs')) {
    return 'TEST_eleven-labs-key';
  } else if (serviceNameLower.includes('stable')) {
    return 'TEST_stable-diffusion-key';
  } else if (serviceNameLower.includes('runway')) {
    return 'TEST_runway-key';
  } else if (serviceNameLower.includes('pika')) {
    return 'TEST_pika-labs-key';
  } else if (serviceNameLower.includes('facebook') || 
             serviceNameLower.includes('meta') || 
             serviceNameLower.includes('instagram')) {
    return 'TEST_meta-platform-key';
  } else if (serviceNameLower.includes('twitter') || 
             serviceNameLower.includes('x')) {
    return 'TEST_twitter-api-key';
  } else if (serviceNameLower.includes('tiktok')) {
    return 'TEST_tiktok-api-key';
  } else if (serviceNameLower.includes('youtube') || 
             serviceNameLower.includes('google')) {
    return 'TEST_google-api-key';
  } else if (serviceNameLower.includes('custom')) {
    return 'TEST_custom-service-key';
  }
  
  // Default for any other service
  return `TEST_${serviceName.toLowerCase().replace(/\s+/g, '-')}-key`;
};

// Function categories mapping for default functions
export const FUNCTION_CATEGORIES = {
  "Text Generation": ["generateContent", "createReport", "summarizeText", "translateContent"],
  "Image Generation": ["generateImage", "editImage", "createThumbnail"],
  "Video Generation": ["generateVideo", "createAnimation"],
  "Audio Generation": ["textToSpeech", "createVoiceover", "generateMusic"],
  "Social Media": ["postToSocial", "schedulePost", "analyzeSocialMetrics"]
};
