
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// API call handler for different services
async function executeApiRequest(
  functionName: string,
  payload: any,
  serviceName: string,
  apiKey: string,
  baseUrl: string,
  category: string
) {
  // Measure response time
  const startTime = Date.now();
  let result: any = null;

  try {
    if (serviceName.toLowerCase().includes("openai")) {
      // Handle OpenAI API calls
      if (functionName === "AI Text Generation") {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: payload.prompt }
            ],
            max_tokens: payload.options?.maxTokens || 500,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        result = data.choices[0].message.content;
      }
    } 
    else if (serviceName.toLowerCase().includes("elevenlabs")) {
      // Handle ElevenLabs API calls
      if (functionName === "Voice Generation") {
        const voiceId = payload.options?.voiceId || "21m00Tcm4TlvDq8ikWAM"; // Default voice
        
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: payload.text,
            model_id: payload.options?.modelId || "eleven_monolingual_v1",
          }),
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
        }

        // In a real implementation, we'd handle the audio data
        // For now, return a success message
        result = "Voice generated successfully";
      }
    }
    else if (serviceName.toLowerCase().includes("stable") && 
             serviceName.toLowerCase().includes("diffusion")) {
      // Handle Stable Diffusion API calls
      if (functionName === "AI Image Creation") {
        // Simulate Stable Diffusion API
        result = "https://example.com/generated-image.jpg";
      }
    }
    else if (serviceName.toLowerCase().includes("runway")) {
      // Handle RunwayML API calls
      if (functionName === "AI Video Generation") {
        // Simulate RunwayML API
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        result = "https://example.com/generated-video.mp4";
      }
    }
    else {
      // Generic handler for other APIs
      console.log(`Using ${serviceName} for ${functionName}`);
      result = `Simulated ${serviceName} API result for ${functionName}`;
    }

    const responseTime = Date.now() - startTime;
    
    return {
      success: true,
      result,
      serviceName,
      category,
      responseTime,
    };
  } catch (error) {
    console.error(`API execution error (${serviceName}):`, error);
    throw error;
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

    const { functionName, payload } = await req.json();
    
    if (!functionName) {
      return new Response(
        JSON.stringify({ success: false, error: "Function name is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Get function mapping for the requested function
    const { data: mappingData, error: mappingError } = await supabaseAdmin
      .from("api_function_mapping")
      .select("*")
      .eq("function_name", functionName)
      .single();
    
    if (mappingError) {
      console.error("Function mapping error:", mappingError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `No mapping found for function: ${functionName}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Get preferred service API key
    const preferredService = mappingData.preferred_service;
    
    const { data: apiKeyData, error: apiKeyError } = await supabaseAdmin
      .from("api_keys")
      .select("*")
      .eq("service_name", preferredService)
      .eq("status", "active")
      .single();
    
    if (apiKeyError || !apiKeyData) {
      console.error("API key error:", apiKeyError);
      
      // Check if there's a fallback service defined
      if (mappingData.fallback_service) {
        console.log(`Trying fallback service: ${mappingData.fallback_service}`);
        
        // Get fallback service API key
        const { data: fallbackKeyData, error: fallbackKeyError } = await supabaseAdmin
          .from("api_keys")
          .select("*")
          .eq("service_name", mappingData.fallback_service)
          .eq("status", "active")
          .single();
        
        if (fallbackKeyError || !fallbackKeyData) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `No valid API key found for function: ${functionName}` 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        
        // Execute API call with fallback service
        try {
          const result = await executeApiRequest(
            functionName,
            payload,
            fallbackKeyData.service_name,
            fallbackKeyData.api_key,
            fallbackKeyData.base_url || "",
            fallbackKeyData.category
          );
          
          return new Response(
            JSON.stringify({ success: true, ...result }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (execError) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `API execution error with fallback: ${execError.message}` 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `No valid API key found for function: ${functionName}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Execute API call with preferred service
    try {
      const result = await executeApiRequest(
        functionName,
        payload,
        apiKeyData.service_name,
        apiKeyData.api_key,
        apiKeyData.base_url || "",
        apiKeyData.category
      );
      
      return new Response(
        JSON.stringify({ success: true, ...result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (execError) {
      // Try fallback if available
      if (mappingData.fallback_service) {
        console.log(`Primary service failed. Trying fallback service: ${mappingData.fallback_service}`);
        
        // Get fallback service API key
        const { data: fallbackKeyData, error: fallbackKeyError } = await supabaseAdmin
          .from("api_keys")
          .select("*")
          .eq("service_name", mappingData.fallback_service)
          .eq("status", "active")
          .single();
        
        if (fallbackKeyError || !fallbackKeyData) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Primary service failed and no valid fallback found: ${execError.message}` 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
        
        // Execute API call with fallback service
        try {
          const result = await executeApiRequest(
            functionName,
            payload,
            fallbackKeyData.service_name,
            fallbackKeyData.api_key,
            fallbackKeyData.base_url || "",
            fallbackKeyData.category
          );
          
          return new Response(
            JSON.stringify({ success: true, ...result }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (fallbackError) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Both primary and fallback services failed: ${fallbackError.message}` 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `API execution error: ${execError.message}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
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
