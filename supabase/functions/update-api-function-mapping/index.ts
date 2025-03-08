
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

    const { functionName, preferredService, fallbackService } = await req.json();
    
    // Check if mapping already exists
    const { data: existingMapping } = await supabaseAdmin
      .from("api_function_mapping")
      .select("id")
      .eq("function_name", functionName)
      .single();
    
    let result;
    
    if (existingMapping) {
      // Update existing mapping
      result = await supabaseAdmin
        .from("api_function_mapping")
        .update({
          preferred_service: preferredService,
          fallback_service: fallbackService,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingMapping.id);
    } else {
      // Create new mapping
      result = await supabaseAdmin
        .from("api_function_mapping")
        .insert({
          function_name: functionName,
          preferred_service: preferredService,
          fallback_service: fallbackService
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
      JSON.stringify({ 
        success: true, 
        message: `API Function Mapping for ${functionName} updated successfully` 
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
