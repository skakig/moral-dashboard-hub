
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Define validation types directly in this file
interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Basic validation functions
function validateApiKey(serviceName: string, apiKey: string, baseUrl: string = ""): ValidationResult {
  if (apiKey.startsWith("TEST_")) {
    console.log(`Using test API key for ${serviceName}`);
    return { isValid: true };
  }
  
  // Simplified validation - in production, you should implement proper validation
  // or make API calls to validate the API key
  if (apiKey.length < 8) {
    return { 
      isValid: false, 
      errorMessage: `API key for ${serviceName} appears to be too short` 
    };
  }
  
  // Basic pattern checks for common API services
  if (serviceName.toLowerCase().includes("openai") && !apiKey.startsWith("sk-")) {
    return {
      isValid: false,
      errorMessage: `OpenAI API keys should start with 'sk-'`
    };
  }
  
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
    console.log("Starting update-api-key function");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { id, apiKey, baseUrl, isPrimary } = await req.json();
    
    if (!id || !apiKey) {
      console.error("Missing required fields: id and apiKey");
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: id and apiKey" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Fetch the existing key data
    const { data: existingKey, error: fetchError } = await supabaseAdmin
      .from("api_keys")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching existing key:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: `API key not found: ${fetchError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    console.log(`Updating API key for ${existingKey.service_name}`);
    
    // Validate the API key
    let validationResult = { isValid: true, errorMessage: undefined };
    let validationErrors = [];
    
    if (!apiKey.startsWith("TEST_")) {
      try {
        validationResult = validateApiKey(existingKey.service_name, apiKey, baseUrl || "");
        
        if (!validationResult.isValid) {
          validationErrors.push(validationResult.errorMessage || `Invalid API key for ${existingKey.service_name}`);
          console.warn("Validation warning:", validationResult.errorMessage);
          // We'll still save the key, but mark it with validation errors
        }
      } catch (validationError) {
        console.error("Validation error:", validationError);
        validationErrors.push(`Validation error: ${validationError.message}`);
        // Continue with saving the key
      }
    }
    
    // Update the API key
    const updateData: Record<string, any> = {
      api_key: apiKey,
      base_url: baseUrl || existingKey.base_url || '',
      updated_at: new Date().toISOString(),
      validation_errors: validationErrors.length > 0 ? validationErrors : null
    };
    
    // If validation was successful, update last_validated
    if (validationResult.isValid) {
      updateData.last_validated = new Date().toISOString();
    }
    
    // Handle primary flag if specified
    if (isPrimary !== undefined) {
      updateData.is_primary = isPrimary;
      
      // If setting this key as primary, reset other keys in the same category
      if (isPrimary) {
        const { error: resetError } = await supabaseAdmin
          .from("api_keys")
          .update({ is_primary: false })
          .eq("category", existingKey.category)
          .neq("id", id);
        
        if (resetError) {
          console.warn("Error resetting other keys' primary status:", resetError);
          // Continue anyway
        }
      }
    }
    
    const { error: updateError } = await supabaseAdmin
      .from("api_keys")
      .update(updateData)
      .eq("id", id);
    
    if (updateError) {
      console.error("Error updating API key:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${existingKey.service_name} API key updated successfully`,
        validationWarnings: validationErrors,
        isValid: validationResult.isValid 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Exception:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
