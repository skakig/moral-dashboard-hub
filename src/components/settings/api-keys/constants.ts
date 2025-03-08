
/**
 * API Service Categories and available services for each category
 */
export const API_CATEGORIES = {
  'Text Generation': {
    description: 'Power AI text generation, chat, and completion features',
    services: ['OpenAI', 'Anthropic', 'Cohere', 'Custom Text API']
  },
  'Image Generation': {
    description: 'Create AI-generated images and graphics',
    services: ['Stable Diffusion', 'DALL-E', 'Midjourney API', 'Custom Image API']
  },
  'Video Generation': {
    description: 'Generate AI-powered videos and animations',
    services: ['Runway', 'Synthesia', 'Custom Video API']
  },
  'Audio Generation': {
    description: 'Create AI voice, audio clips, and music',
    services: ['ElevenLabs', 'PlayHT', 'Mubert', 'Custom Audio API']
  },
  'Embeddings': {
    description: 'Vector embeddings for semantic search and similarity',
    services: ['OpenAI Embeddings', 'Cohere Embeddings', 'Custom Embeddings API']
  },
};

/**
 * Function categories for API function mapping
 */
export const FUNCTION_CATEGORIES = {
  'Content Generation': 'AI content creation functions',
  'Embeddings & Search': 'Vector storage and semantic search',
  'Analytics': 'Data analysis and reporting',
  'Authentication': 'User authentication services',
  'Media Processing': 'Audio, video, and image processing',
  'Communication': 'Messaging and notification services'
};

/**
 * Determine if a service requires a base URL
 * @param serviceName The service to check
 * @returns Boolean indicating if base URL is needed
 */
export function needsBaseUrlForService(serviceName: string): boolean {
  if (!serviceName) return false;
  
  // These services usually don't need a base URL
  const noBaseUrlServices = [
    'OpenAI',
    'Anthropic',
    'Cohere',
    'DALL-E',
    'ElevenLabs',
  ];
  
  // If service name contains 'custom', it likely needs a base URL
  if (serviceName.toLowerCase().includes('custom')) {
    return true;
  }
  
  return !noBaseUrlServices.includes(serviceName);
}

/**
 * Get a test key for a service (for demo purposes)
 * @param serviceName The service name
 * @returns A placeholder test key
 */
export function getTestKeyForService(serviceName: string): string {
  if (!serviceName) return 'TEST_api_key';
  
  // Map service names to appropriate test key formats
  const testKeyMap: Record<string, string> = {
    'OpenAI': 'TEST_sk-openaiapikey123456789',
    'Anthropic': 'TEST_anthropic-api-key-123456',
    'Cohere': 'TEST_cohere-api-key-123456',
    'Stable Diffusion': 'TEST_sd-api-key-123456',
    'DALL-E': 'TEST_dalle-api-key-123456',
    'Midjourney API': 'TEST_mj-api-key-123456',
    'Runway': 'TEST_runway-api-key-123456',
    'ElevenLabs': 'TEST_eleven-api-key-123456',
    'PlayHT': 'TEST_playht-api-key-123456',
  };
  
  return testKeyMap[serviceName] || `TEST_${serviceName.toLowerCase().replace(/\s+/g, '-')}-key-123456`;
}
