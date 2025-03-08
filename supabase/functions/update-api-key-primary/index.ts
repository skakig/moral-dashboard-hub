
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
    console.log("Starting update-api-key-primary function");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { id, category } = await req.json();
    
    if (!id || !category) {
      console.error("Missing required fields: id or category");
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: id or category" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Setting key ${id} as primary for category ${category}`);
    
    // First, get the service name of the key we're making primary
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from("api_keys")
      .select("service_name")
      .eq("id", id)
      .single();
      
    if (keyError) {
      console.error("Error fetching key info:", keyError);
      return new Response(
        JSON.stringify({ success: false, error: keyError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // First, update all keys in this category to not be primary
    const { error: updateAllError } = await supabaseAdmin
      .from("api_keys")
      .update({ 
        is_primary: false,
        updated_at: new Date().toISOString()
      })
      .eq("category", category);
    
    if (updateAllError) {
      console.error("Error resetting primary flags:", updateAllError);
      return new Response(
        JSON.stringify({ success: false, error: updateAllError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Then, set this key as primary
    const { error: updateError } = await supabaseAdmin
      .from("api_keys")
      .update({ 
        is_primary: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
    
    if (updateError) {
      console.error("Error setting primary key:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Update function mappings that use this service to use this key as preferred
    const { error: updateMappingsError } = await supabaseAdmin
      .from("api_function_mapping")
      .update({ 
        preferred_service: keyData.service_name,
        updated_at: new Date().toISOString()
      })
      .eq("category", category);
      
    if (updateMappingsError) {
      console.log("Note: Could not update function mappings:", updateMappingsError);
      // Continue, this is not a critical error
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Primary API key updated successfully`,
        service: keyData.service_name
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
