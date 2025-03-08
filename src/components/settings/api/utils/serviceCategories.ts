
import { API_CATEGORIES, needsBaseUrlForService, getTestKeyForService } from '../constants';

/**
 * Helper functions to categorize API services
 */

/**
 * Determines the category for a service based on its name
 */
export const getCategoryForService = (serviceName: string): string => {
  if (!serviceName) return 'Other';
  
  const serviceNameLower = serviceName.toLowerCase();
  
  // Check in our predefined categories
  for (const [category, services] of Object.entries(API_CATEGORIES)) {
    if (services.some(service => serviceNameLower.includes(service.toLowerCase()))) {
      return category;
    }
  }
  
  // Handle custom services
  if (serviceNameLower.includes('custom')) {
    return 'Custom';
  }
  
  // Legacy categorization for backward compatibility
  if (serviceNameLower.includes('openai') || 
      serviceNameLower.includes('anthropic') || 
      serviceNameLower.includes('google')) {
    return 'Text Generation';
  } else if (serviceNameLower.includes('stability') || 
            serviceNameLower.includes('replicate') || 
            serviceNameLower.includes('dalle')) {
    return 'Image Generation';
  } else if (serviceNameLower.includes('runway')) {
    return 'Video Generation';
  } else if (serviceNameLower.includes('facebook') || 
            serviceNameLower.includes('meta') || 
            serviceNameLower.includes('twitter') || 
            serviceNameLower.includes('tiktok')) {
    return 'Social Media';
  }
  
  return 'Other';
};

// Re-export from constants for backward compatibility
export { needsBaseUrlForService, getTestKeyForService };
