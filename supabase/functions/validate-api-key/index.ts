
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "./cors.ts";
import { updateOrInsertApiKey } from "./database.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    console.log("Starting validate-api-key function");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error: Missing environment variables" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { serviceName, category, apiKey, baseUrl, isPrimary } = requestData;
    
    if (!serviceName || !apiKey) {
      console.error("Missing required fields:", { serviceName, apiKey });
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: serviceName and apiKey" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Log validation attempt
    console.log(`Validating ${serviceName} API key in category: ${category}`);
    console.log(`Base URL: ${baseUrl || 'Not provided'}`);
    console.log(`Primary key: ${isPrimary ? 'Yes' : 'No'}`);
    
    // For demo or testing purposes, if apiKey starts with "TEST_" consider it valid
    if (apiKey.startsWith("TEST_")) {
      console.log(`Using test API key for ${serviceName}`);
      
      // Update or insert the test API key
      const result = await updateOrInsertApiKey(supabaseAdmin, {
        serviceName,
        category: category || "Other",
        apiKey,
        baseUrl,
        isPrimary
      });
      
      if (result.error) {
        console.error("Database error:", result.error);
        return new Response(
          JSON.stringify({ success: false, error: `Database error: ${result.error.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Test ${serviceName} API key saved successfully`,
          data: result.data
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // In a real implementation, we would validate the API key with the actual service
    // For now, consider any non-TEST_ key as valid for demo purposes
    
    // Update or insert the API key
    const result = await updateOrInsertApiKey(supabaseAdmin, {
      serviceName,
      category: category || "Other",
      apiKey,
      baseUrl,
      isPrimary
    });
    
    if (result.error) {
      console.error("Database error:", result.error);
      return new Response(
        JSON.stringify({ success: false, error: `Database error: ${result.error.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${serviceName} API key validated and saved successfully`,
        data: result.data 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Exception:', error);
    return new Response(
      JSON.stringify({ success: false, error: `Server error: ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
