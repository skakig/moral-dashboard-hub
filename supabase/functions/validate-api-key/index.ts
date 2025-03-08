
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// Handler for different API validations
async function validateApiKey(serviceName: string, apiKey: string, baseUrl: string): Promise<ValidationResult> {
  try {
    // Default result assumes failure
    let result: ValidationResult = { isValid: false, errorMessage: `Failed to validate ${serviceName} API key` };
    
    // Validation logic for different services
    if (serviceName.toLowerCase().includes("openai")) {
      // Test OpenAI API key
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 200) {
        result.isValid = true;
      } else {
        const error = await response.json();
        result.errorMessage = error.error?.message || "Invalid OpenAI API key";
      }
    } 
    else if (serviceName.toLowerCase().includes("elevenlabs")) {
      // Test ElevenLabs API key
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
      });
      
      if (response.status >= 200 && response.status < 300) {
        result.isValid = true;
      } else {
        try {
          const error = await response.json();
          result.errorMessage = error.detail?.message || "Invalid ElevenLabs API key";
        } catch (e) {
          result.errorMessage = `ElevenLabs API error: ${response.status} ${response.statusText}`;
        }
      }
    }
    else if (serviceName.toLowerCase().includes("stable") && serviceName.toLowerCase().includes("diffusion")) {
      // For demo purposes, we'll just check if it matches a certain pattern
      result.isValid = apiKey.length > 30;
      if (!result.isValid) {
        result.errorMessage = "Stable Diffusion API key appears to be invalid";
      }
    }
    else if (serviceName.toLowerCase().includes("runway")) {
      // RunwayML validation logic
      const response = await fetch(`${baseUrl}/user`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 200) {
        result.isValid = true;
      } else {
        result.errorMessage = "Invalid RunwayML API key";
      }
    }
    else if (serviceName.toLowerCase().includes("pika")) {
      // Simple validation for Pika Labs
      result.isValid = apiKey.length > 20 && apiKey.startsWith("pika_");
      if (!result.isValid) {
        result.errorMessage = "Pika API key appears to be invalid";
      }
    }
    else {
      // Generic validation for other services - just check format
      result.isValid = apiKey.length > 10;
      if (!result.isValid) {
        result.errorMessage = `${serviceName} API key appears to be invalid`;
      }
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { serviceName, category, apiKey, baseUrl } = await req.json();
    
    // Log validation attempt
    console.log(`Validating ${serviceName} API key in category: ${category}`);
    
    // Validate API key based on service
    const validation = await validateApiKey(serviceName, apiKey, baseUrl || "");
    
    // If validation was successful, update the key in the database
    if (validation.isValid) {
      // Check if the service exists first to handle the unique constraint
      const { data: existingKey } = await supabaseAdmin
        .from("api_keys")
        .select("id")
        .eq("service_name", serviceName)
        .eq("category", category)
        .single();
      
      let result;
      if (existingKey) {
        // Update existing record
        result = await supabaseAdmin
          .from("api_keys")
          .update({ 
            api_key: apiKey,
            base_url: baseUrl || '',
            last_validated: new Date().toISOString(),
            status: 'active'
          })
          .eq("id", existingKey.id);
      } else {
        // Insert new record
        result = await supabaseAdmin
          .from("api_keys")
          .insert({ 
            service_name: serviceName,
            category: category,
            api_key: apiKey,
            base_url: baseUrl || '',
            last_validated: new Date().toISOString(),
            status: 'active'
          });
      }
      
      if (result.error) {
        console.error("Database error:", result.error);
        return new Response(
          JSON.stringify({ success: false, error: result.error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, message: `${serviceName} API key validated and saved successfully` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: validation.errorMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Exception:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
