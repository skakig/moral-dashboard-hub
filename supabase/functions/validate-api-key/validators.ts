
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// Collection of validation functions for different service types
const validators = {
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
  
  stableDiffusion: (apiKey: string): ValidationResult => {
    // Simple validation for Stable Diffusion
    const isValid = apiKey.length > 20;
    return {
      isValid,
      errorMessage: isValid ? undefined : "Stable Diffusion API key appears to be invalid"
    };
  },
  
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
  },
  
  pika: (apiKey: string): ValidationResult => {
    // Simple validation for Pika Labs
    const isValid = apiKey.length > 20 && apiKey.startsWith("pika_");
    return {
      isValid,
      errorMessage: isValid ? undefined : "Pika API key appears to be invalid"
    };
  },
  
  meta: (apiKey: string): ValidationResult => {
    // Simple validation for Meta APIs
    const isValid = apiKey.length > 20;
    return {
      isValid,
      errorMessage: isValid ? undefined : "Meta API key appears to be invalid"
    };
  },
  
  tiktok: (apiKey: string): ValidationResult => {
    // Simple validation for TikTok
    const isValid = apiKey.length > 15;
    return {
      isValid,
      errorMessage: isValid ? undefined : "TikTok API key appears to be invalid"
    };
  },
  
  google: (apiKey: string): ValidationResult => {
    // Simple validation for Google/YouTube
    const isValid = apiKey.length > 20;
    return {
      isValid,
      errorMessage: isValid ? undefined : "YouTube/Google API key appears to be invalid"
    };
  },
  
  twitter: (apiKey: string): ValidationResult => {
    // Simple validation for Twitter/X
    const isValid = apiKey.length > 20;
    return {
      isValid,
      errorMessage: isValid ? undefined : "Twitter/X API key appears to be invalid"
    };
  },
  
  // Generic fallback validation
  generic: (apiKey: string, serviceName: string): ValidationResult => {
    const isValid = apiKey.length > 10;
    return {
      isValid,
      errorMessage: isValid ? undefined : `${serviceName} API key appears to be invalid`
    };
  }
};

// Main validation handler for all API keys
export async function validateApiKey(serviceName: string, apiKey: string, baseUrl: string): Promise<ValidationResult> {
  try {
    // Normalize service name for matching
    const serviceNameLower = serviceName.toLowerCase();
    
    // Match the service to the appropriate validator
    let result: ValidationResult;
    
    if (serviceNameLower.includes("openai")) {
      result = await validators.openai(apiKey);
    } 
    else if (serviceNameLower.includes("elevenlabs")) {
      result = await validators.elevenlabs(apiKey);
    }
    else if (serviceNameLower.includes("stable") && serviceNameLower.includes("diffusion")) {
      result = validators.stableDiffusion(apiKey);
    }
    else if (serviceNameLower.includes("runway")) {
      result = await validators.runway(apiKey, baseUrl);
    }
    else if (serviceNameLower.includes("pika")) {
      result = validators.pika(apiKey);
    }
    else if (serviceNameLower.includes("meta") || 
             serviceNameLower.includes("facebook") || 
             serviceNameLower.includes("instagram")) {
      result = validators.meta(apiKey);
    }
    else if (serviceNameLower.includes("tiktok")) {
      result = validators.tiktok(apiKey);
    }
    else if (serviceNameLower.includes("youtube") || 
             serviceNameLower.includes("google")) {
      result = validators.google(apiKey);
    }
    else if (serviceNameLower.includes("twitter") || 
             serviceNameLower.includes("x")) {
      result = validators.twitter(apiKey);
    }
    else {
      // Generic validation for other services
      result = validators.generic(apiKey, serviceName);
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
