
import { ValidationResult } from "./validator-types.ts";

/**
 * Validators that make actual API calls to verify keys
 */
export const apiValidators = {
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
