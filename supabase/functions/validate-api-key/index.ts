
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";

/**
 * Interface for validation result
 */
interface ValidationResult {
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
async function validateApiKey(
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
  } else if (serviceLower.includes("eleven") || serviceLower.includes("elevenlabs")) {
    // ElevenLabs API key format checks (basic format validation)
    const elevenLabsRegex = /^[0-9a-fA-F]{32,}$/;
    if (!elevenLabsRegex.test(apiKey)) {
      // This is just a warning, not a hard validation failure
      console.warn("ElevenLabs API key does not match expected format");
    }
  }
  
  // If we reached here and no specific validation failed, the key is considered valid
  return { isValid: true };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { serviceName, apiKey, baseUrl } = await req.json();
    
    if (!serviceName || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: serviceName and apiKey are required" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    console.log(`Validating API key for service ${serviceName}`);
    
    const result = await validateApiKey(serviceName, apiKey, baseUrl);
    
    if (result.isValid) {
      console.log(`API key validation successful for ${serviceName}`);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.warn(`API key validation failed for ${serviceName}: ${result.errorMessage}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.errorMessage || "Invalid API key"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error during API key validation:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error during validation"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
