
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

    const { 
      serviceName, 
      category,
      requestPayload,
      responsePayload,
      success,
      responseTimeMs,
      errorMessage 
    } = await req.json();
    
    // Log API usage
    const result = await supabaseAdmin
      .from("api_usage_logs")
      .insert({
        service_name: serviceName,
        category: category,
        request_payload: requestPayload,
        response_payload: responsePayload,
        success: success,
        response_time_ms: responseTimeMs,
        error_message: errorMessage
      });
    
    if (result.error) {
      console.error("Database error:", result.error);
      return new Response(
        JSON.stringify({ success: false, error: result.error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Update rate limits if tracking is enabled
    const { data: rateLimitData } = await supabaseAdmin
      .from("api_rate_limits")
      .select("id, requests_used, request_limit")
      .eq("service_name", serviceName)
      .single();

    if (rateLimitData) {
      // Increment request count
      const updatedRequests = rateLimitData.requests_used + 1;
      
      await supabaseAdmin
        .from("api_rate_limits")
        .update({
          requests_used: updatedRequests,
          updated_at: new Date().toISOString()
        })
        .eq("id", rateLimitData.id);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `API usage logged successfully` 
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
