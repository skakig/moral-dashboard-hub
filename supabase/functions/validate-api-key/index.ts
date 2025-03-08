
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "./cors.ts";
import { updateOrInsertApiKey } from "./database.ts";
import { validateApiKey } from "./validators.ts";

/**
 * Initialize Supabase client
 * @returns SupabaseClient instance
 * @throws Error if environment variables are missing
 */
function initSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    throw new Error("Server configuration error: Missing environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Parse and validate the request body
 * @param req Request object
 * @returns Parsed request data or throws error
 */
async function parseRequestBody(req) {
  try {
    const data = await req.json();
    const { serviceName, category, apiKey, baseUrl, isPrimary } = data;
    
    if (!serviceName || !apiKey) {
      console.error("Missing required fields:", { serviceName, apiKey });
      throw new Error("Missing required fields: serviceName and apiKey");
    }
    
    return { serviceName, category: category || "Other", apiKey, baseUrl, isPrimary };
  } catch (parseError) {
    console.error("Failed to parse request body:", parseError);
    throw new Error("Invalid request format");
  }
}

/**
 * Validate the API key with appropriate service
 * @param serviceName The name of the service
 * @param apiKey The API key to validate
 * @param baseUrl Optional base URL for the service
 * @returns Validation result object
 */
async function validateServiceApiKey(serviceName, apiKey, baseUrl) {
  console.log(`Validating ${serviceName} API key`);
  console.log(`Base URL: ${baseUrl || 'Not provided'}`);
  
  // For test keys, return valid without validation
  if (apiKey.startsWith("TEST_")) {
    console.log(`Using test API key for ${serviceName}`);
    return { isValid: true };
  }
  
  // Perform actual validation using the validators module
  try {
    const validationResult = await validateApiKey(serviceName, apiKey, baseUrl);
    
    if (!validationResult.isValid) {
      console.log(`Validation failed for ${serviceName}: ${validationResult.errorMessage}`);
    } else {
      console.log(`Successfully validated ${serviceName} API key`);
    }
    
    return validationResult;
  } catch (error) {
    console.error(`Error during ${serviceName} validation:`, error);
    throw error;
  }
}

/**
 * Handle the API validation request
 * @param req The HTTP request
 * @returns Response object
 */
async function handleValidationRequest(req) {
  try {
    // Initialize Supabase client
    const supabaseAdmin = initSupabaseClient();
    
    // Parse request data
    const { serviceName, category, apiKey, baseUrl, isPrimary } = await parseRequestBody(req);
    
    // Log validation attempt
    console.log(`Processing ${serviceName} API key validation in category: ${category}`);
    console.log(`Primary key: ${isPrimary ? 'Yes' : 'No'}`);
    
    // Validate the API key
    const validationResult = await validateServiceApiKey(serviceName, apiKey, baseUrl);
    
    // Update or insert the API key
    const result = await updateOrInsertApiKey(supabaseAdmin, {
      serviceName,
      category,
      apiKey,
      baseUrl,
      isPrimary
    });
    
    if (result.error) {
      console.error("Database error:", result.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Database error: ${result.error.message}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${serviceName} API key ${validationResult.isValid ? 'validated and' : ''} saved successfully`,
        data: result.data,
        validationWarnings: validationResult.isValid ? null : [validationResult.errorMessage]
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Exception in validation handler:', error);
    return new Response(
      JSON.stringify({ success: false, error: `Server error: ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

// Define the main server handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  console.log("Starting validate-api-key function");
  
  try {
    return await handleValidationRequest(req);
  } catch (error) {
    console.error('Unhandled exception:', error);
    return new Response(
      JSON.stringify({ success: false, error: `Server error: ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
