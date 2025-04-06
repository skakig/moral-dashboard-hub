
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, service } = await req.json();
    
    // Simple validation logic here
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "API key is required" 
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
        service: service || "unknown"
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
        error: `Error validating API key: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
