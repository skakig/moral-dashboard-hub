
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { serviceName, apiKey } = await req.json();
    
    // Validate API key based on service
    let isValid = false;
    let errorMessage = "";
    
    if (serviceName === "OpenAI") {
      try {
        // Test OpenAI API key
        const response = await fetch("https://api.openai.com/v1/models", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.status === 200) {
          isValid = true;
        } else {
          const error = await response.json();
          errorMessage = error.error?.message || "Invalid OpenAI API key";
        }
      } catch (error) {
        errorMessage = error.message || "Failed to validate OpenAI API key";
      }
    } 
    else if (serviceName === "ElevenLabs") {
      try {
        // Test ElevenLabs API key
        const response = await fetch("https://api.elevenlabs.io/v1/voices", {
          method: "GET",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
        });
        
        if (response.status === 200) {
          isValid = true;
        } else {
          const error = await response.json();
          errorMessage = error.detail?.message || "Invalid ElevenLabs API key";
        }
      } catch (error) {
        errorMessage = error.message || "Failed to validate ElevenLabs API key";
      }
    }
    else if (serviceName === "StableDiffusion") {
      // For the demo, we'll just check if it matches a certain pattern
      // In production, you'd validate with the actual API
      isValid = apiKey.length > 30;
      if (!isValid) {
        errorMessage = "Stable Diffusion API key appears to be invalid";
      }
    }
    
    // If validation was successful, update the key in the database
    if (isValid) {
      // Check if the service exists first to handle the unique constraint
      const { data: existingKey } = await supabaseAdmin
        .from("api_keys")
        .select("id")
        .eq("service_name", serviceName)
        .single();
      
      let result;
      if (existingKey) {
        // Update existing record
        result = await supabaseAdmin
          .from("api_keys")
          .update({ 
            api_key: apiKey,
            last_validated: new Date().toISOString(),
            is_active: true
          })
          .eq("service_name", serviceName);
      } else {
        // Insert new record
        result = await supabaseAdmin
          .from("api_keys")
          .insert({ 
            service_name: serviceName, 
            api_key: apiKey,
            last_validated: new Date().toISOString(),
            is_active: true
          });
      }
      
      if (result.error) {
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
        JSON.stringify({ success: false, error: errorMessage }),
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
