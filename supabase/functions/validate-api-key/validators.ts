
/**
 * Interface for validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates an API key for a specific service
 * @param serviceName Name of the service (e.g., OpenAI, ElevenLabs)
 * @param apiKey The API key to validate
 * @param baseUrl Optional base URL for the service
 * @returns ValidationResult with isValid flag and optional error message
 */
export async function validateApiKey(
  serviceName: string,
  apiKey: string,
  baseUrl: string = ""
): Promise<ValidationResult> {
  // Handle test keys
  if (apiKey.startsWith("TEST_")) {
    console.log(`Using test API key for ${serviceName}`);
    return { isValid: true };
  }
  
  // Basic validation checks
  if (!apiKey || apiKey.trim() === "") {
    return { 
      isValid: false, 
      errorMessage: "API key cannot be empty" 
    };
  }
  
  if (apiKey.length < 8) {
    return { 
      isValid: false, 
      errorMessage: `API key for ${serviceName} appears to be too short` 
    };
  }
  
  // Service-specific validation
  const serviceLower = serviceName.toLowerCase();
  
  if (serviceLower.includes("openai")) {
    // OpenAI API key format check
    if (!apiKey.startsWith("sk-")) {
      return {
        isValid: false,
        errorMessage: `OpenAI API keys should start with 'sk-'`
      };
    }
    
    // Optional: Make test request to validate OpenAI key
    // This is commented out as it would require additional dependencies
    /*
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });
      
      if (!response.ok) {
        return {
          isValid: false,
          errorMessage: `OpenAI API key validation failed: ${response.status} ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Error validating OpenAI API key: ${error.message}`
      };
    }
    */
  } else if (serviceLower.includes("eleven") || serviceLower.includes("elevenlabs")) {
    // ElevenLabs API key format checks
    // As of my knowledge, ElevenLabs uses hexadecimal format keys
    const elevenLabsRegex = /^[0-9a-fA-F]{32,}$/;
    if (!elevenLabsRegex.test(apiKey)) {
      // This is just a warning, not a hard validation failure
      console.warn("ElevenLabs API key does not match expected format");
    }
    
    // Optional: Make test request to validate ElevenLabs key
    // This is commented out as it would require additional dependencies
    /*
    try {
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: {
          "xi-api-key": apiKey
        }
      });
      
      if (!response.ok) {
        return {
          isValid: false,
          errorMessage: `ElevenLabs API key validation failed: ${response.status} ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Error validating ElevenLabs API key: ${error.message}`
      };
    }
    */
  }
  
  // If we reached here and no specific validation failed, the key is considered valid
  return { isValid: true };
}
