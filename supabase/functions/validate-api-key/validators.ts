
import { ValidationResult } from "./validator-types.ts";
import { apiValidators } from "./api-validators.ts";
import { serviceValidators } from "./service-validators.ts";
import { getValidatorForService } from "./service-mapping.ts";

/**
 * Main validation handler for all API keys
 * @param serviceName The service name for the API key
 * @param apiKey The API key to validate
 * @param baseUrl Optional base URL for the service
 * @returns ValidationResult with isValid status and optional error message
 */
export async function validateApiKey(
  serviceName: string, 
  apiKey: string, 
  baseUrl: string
): Promise<ValidationResult> {
  try {
    // For test keys, always return valid
    if (apiKey.startsWith("TEST_")) {
      console.log(`Using test API key for ${serviceName}`);
      return { isValid: true };
    }
    
    // Get the appropriate validator for this service
    const validatorType = getValidatorForService(serviceName);
    let result: ValidationResult;
    
    console.log(`Using ${validatorType} validator for ${serviceName}`);
    
    // Call the appropriate validator
    switch (validatorType) {
      case "openai":
        result = await apiValidators.openai(apiKey);
        break;
      case "elevenlabs":
        result = await apiValidators.elevenlabs(apiKey);
        break;
      case "runway":
        result = await apiValidators.runway(apiKey, baseUrl);
        break;
      case "stableDiffusion":
        result = serviceValidators.stableDiffusion(apiKey);
        break;
      case "pika":
        result = serviceValidators.pika(apiKey);
        break;
      case "meta":
        result = serviceValidators.meta(apiKey);
        break;
      case "tiktok":
        result = serviceValidators.tiktok(apiKey);
        break;
      case "google":
        result = serviceValidators.google(apiKey);
        break;
      case "twitter":
        result = serviceValidators.twitter(apiKey);
        break;
      default:
        result = serviceValidators.generic(apiKey, serviceName);
    }
    
    return result;
  } catch (error) {
    console.error(`Error validating ${serviceName} API key:`, error);
    return { 
      isValid: false, 
      errorMessage: error.message || `Failed to validate ${serviceName} API key` 
    };
  }
}
