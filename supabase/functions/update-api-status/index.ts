
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

    const { serviceName, category, isActive } = await req.json();
    
    // Log the request
    console.log(`Updating ${serviceName} status in category ${category} to ${isActive ? 'active' : 'inactive'}`);
    
    // Find the API key record
    const { data: existingKey, error: findError } = await supabaseAdmin
      .from("api_keys")
      .select("id")
      .eq("service_name", serviceName)
      .eq("category", category)
      .single();
    
    if (findError) {
      console.error("Error finding API key:", findError);
      return new Response(
        JSON.stringify({ success: false, error: `API key for ${serviceName} not found` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Update the status
    const { error: updateError } = await supabaseAdmin
      .from("api_keys")
      .update({ 
        status: isActive ? 'active' : 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq("id", existingKey.id);
    
    if (updateError) {
      console.error("Error updating API key status:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Log API usage
    try {
      await supabaseAdmin.functions.invoke('log-api-usage', {
        body: {
          serviceName,
          category,
          success: true,
          responseTime: 0,
          request: { action: 'update_status', isActive },
          response: { success: true }
        },
      });
    } catch (logError) {
      // Non-critical, just log the error but continue
      console.error('Failed to log API usage:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${serviceName} API status updated to ${isActive ? 'active' : 'inactive'} successfully` 
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
