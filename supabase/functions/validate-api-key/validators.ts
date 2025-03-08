
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// Basic validators for simple API key pattern matching
const basicValidators = {
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

// API validators for services that require actual API calls
const apiValidators = {
  // OpenAI API key validation
  openai: async (apiKey: string): Promise<ValidationResult> => {
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 200) {
        return { isValid: true };
      } else {
        const error = await response.json();
        return { 
          isValid: false, 
          errorMessage: error.error?.message || "Invalid OpenAI API key" 
        };
      }
    } catch (error) {
      return { 
        isValid: false, 
        errorMessage: `OpenAI API error: ${error.message}` 
      };
    }
  },
  
  // ElevenLabs API key validation
  elevenlabs: async (apiKey: string): Promise<ValidationResult> => {
    try {
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
      });
      
      if (response.status >= 200 && response.status < 300) {
        return { isValid: true };
      } else {
        try {
          const error = await response.json();
          return { 
            isValid: false, 
            errorMessage: error.detail?.message || "Invalid ElevenLabs API key" 
          };
        } catch (e) {
          return { 
            isValid: false, 
            errorMessage: `ElevenLabs API error: ${response.status} ${response.statusText}` 
          };
        }
      }
    } catch (error) {
      return { 
        isValid: false, 
        errorMessage: `ElevenLabs API error: ${error.message}` 
      };
    }
  },
  
  // RunwayML API key validation
  runway: async (apiKey: string, baseUrl: string): Promise<ValidationResult> => {
    try {
      const apiBase = baseUrl || "https://api.runwayml.com";
      const response = await fetch(`${apiBase}/v1/user`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 200) {
        return { isValid: true };
      } else {
        return { 
          isValid: false, 
          errorMessage: "Invalid RunwayML API key" 
        };
      }
    } catch (error) {
      return { 
        isValid: false, 
        errorMessage: `RunwayML API error: ${error.message}` 
      };
    }
  }
};

// Service-specific validators
const serviceValidators = {
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

// Utility function to match service name to appropriate validator
function getValidatorForService(serviceName: string): string {
  const serviceNameLower = serviceName.toLowerCase();
  
  if (serviceNameLower.includes("openai")) return "openai";
  if (serviceNameLower.includes("elevenlabs")) return "elevenlabs";
  if (serviceNameLower.includes("stable") && serviceNameLower.includes("diffusion")) return "stableDiffusion";
  if (serviceNameLower.includes("runway")) return "runway";
  if (serviceNameLower.includes("pika")) return "pika";
  if (serviceNameLower.includes("meta") || serviceNameLower.includes("facebook") || serviceNameLower.includes("instagram")) return "meta";
  if (serviceNameLower.includes("tiktok")) return "tiktok";
  if (serviceNameLower.includes("youtube") || serviceNameLower.includes("google")) return "google";
  if (serviceNameLower.includes("twitter") || serviceNameLower.includes("x")) return "twitter";
  
  return "generic";
}

// Main validation handler for all API keys
export async function validateApiKey(serviceName: string, apiKey: string, baseUrl: string): Promise<ValidationResult> {
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
