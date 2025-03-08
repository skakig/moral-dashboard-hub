
import { ValidationResult } from "./validator-types.ts";
import { basicValidators } from "./basic-validators.ts";

/**
 * Service-specific validators for different API services
 */
export const serviceValidators = {
  // Image generation services
  stableDiffusion: (apiKey: string): ValidationResult => {
    return basicValidators.validateLength(apiKey, 20);
  },
  
  pika: (apiKey: string): ValidationResult => {
    // Check both length and pattern
    const lengthResult = basicValidators.validateLength(apiKey, 20);
    if (!lengthResult.isValid) return lengthResult;
    
    return basicValidators.validatePattern(apiKey, "pika_");
  },
  
  // Social media services
  meta: (apiKey: string): ValidationResult => {
    return basicValidators.validateLength(apiKey, 20);
  },
  
  tiktok: (apiKey: string): ValidationResult => {
    return basicValidators.validateLength(apiKey, 15);
  },
  
  google: (apiKey: string): ValidationResult => {
    return basicValidators.validateLength(apiKey, 20);
  },
  
  twitter: (apiKey: string): ValidationResult => {
    return basicValidators.validateLength(apiKey, 20);
  },
  
  // Generic fallback validation for new or custom service types
  generic: (apiKey: string, serviceName: string): ValidationResult => {
    const result = basicValidators.validateLength(apiKey, 10);
    if (!result.isValid) {
      result.errorMessage = `${serviceName} API key appears to be invalid`;
    }
    return result;
  }
};
