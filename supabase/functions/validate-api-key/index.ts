
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";

serve(async (req) => {
  // This is critical: properly handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    const { apiKey, service } = await req.json();
    
    // Provide better validation and error messages
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "API key is required",
          success: false
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // For now, just simulate a valid API key for any service
    console.log(`API key validation requested for service: ${service || "unknown"}`);
    
    return new Response(
      JSON.stringify({
        valid: true,
        service: service || "unknown",
        success: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error validating API key:", error);
    
    return new Response(
      JSON.stringify({ 
        error: `Error validating API key: ${error.message}`,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
