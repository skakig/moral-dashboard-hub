
/**
 * Helper functions to categorize API services
 */

/**
 * Determines the category for a service based on its name
 */
export const getCategoryForService = (serviceName: string): string => {
  const serviceNameLower = serviceName.toLowerCase();
  
  if (serviceNameLower.includes('openai') || serviceNameLower.includes('anthropic') || serviceNameLower.includes('google')) {
    return 'Text Generation';
  } else if (serviceNameLower.includes('stability') || serviceNameLower.includes('replicate') || serviceNameLower.includes('dalle')) {
    return 'Image Generation';
  } else if (serviceNameLower.includes('runway')) {
    return 'Video Generation';
  } else if (serviceNameLower.includes('facebook') || serviceNameLower.includes('meta') || serviceNameLower.includes('twitter') || serviceNameLower.includes('tiktok')) {
    return 'Social Media';
  }
  
  return 'Other';
};

/**
 * Determines if a service requires a base URL
 */
export const needsBaseUrlForService = (serviceName: string): boolean => {
  const serviceNameLower = serviceName.toLowerCase();
  return serviceNameLower.includes('runway') || 
         serviceNameLower.includes('custom') ||
         serviceNameLower.includes('meta') ||
         serviceNameLower.includes('tiktok');
};

/**
 * Generates a test key format for a service
 */
export const getTestKeyForService = (serviceName: string): string => {
  return `TEST_${serviceName.toUpperCase().replace(/\s+/g, '_')}_KEY_123`;
};
