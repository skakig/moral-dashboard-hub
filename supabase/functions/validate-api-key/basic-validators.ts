
import { ValidationResult } from "./validator-types.ts";

/**
 * Basic validators for simple API key pattern matching
 */
export const basicValidators = {
  // Simple length and pattern validation
  validateLength: (apiKey: string, minLength: number = 10): ValidationResult => {
    const isValid = apiKey.length >= minLength;
    return {
      isValid,
      errorMessage: isValid ? undefined : `API key is too short (minimum ${minLength} characters)`
    };
  },
  
  // Validate key pattern starting with specific prefix
  validatePattern: (apiKey: string, prefix: string): ValidationResult => {
    const isValid = apiKey.startsWith(prefix);
    return {
      isValid,
      errorMessage: isValid ? undefined : `API key should start with '${prefix}'`
    };
  }
};
