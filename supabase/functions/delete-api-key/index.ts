
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
    console.log("Starting delete-api-key function");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { id } = await req.json();
    
    if (!id) {
      console.error("Missing required field: id");
      return new Response(
        JSON.stringify({ success: false, error: "Missing required field: id" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Get the API key info before deletion for logging
    const { data: keyData, error: fetchError } = await supabaseAdmin
      .from("api_keys")
      .select("service_name, category")
      .eq("id", id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching API key info:", fetchError);
      // Continue with deletion even if we can't fetch the info
    } else {
      console.log(`Deleting API key for ${keyData.service_name} in category ${keyData.category}`);
    }
    
    // Delete the API key
    const { error: deleteError } = await supabaseAdmin
      .from("api_keys")
      .delete()
      .eq("id", id);
    
    if (deleteError) {
      console.error("Error deleting API key:", deleteError);
      return new Response(
        JSON.stringify({ success: false, error: deleteError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `API key deleted successfully`, 
        service: keyData?.service_name
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
