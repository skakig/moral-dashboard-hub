
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

    // Get all API keys with their categories and functions
    const { data: apiKeys, error: apiKeysError } = await supabaseAdmin
      .from("api_keys")
      .select("id, service_name, category, api_key, base_url, status, created_at, last_validated");

    if (apiKeysError) {
      console.error("Database error (api_keys):", apiKeysError);
      return new Response(
        JSON.stringify({ success: false, error: apiKeysError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get function mappings
    const { data: functionMappings, error: mappingsError } = await supabaseAdmin
      .from("api_function_mapping")
      .select("*");

    if (mappingsError) {
      console.error("Database error (api_function_mapping):", mappingsError);
      return new Response(
        JSON.stringify({ success: false, error: mappingsError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get API usage data if available
    const { data: apiUsage, error: usageError } = await supabaseAdmin
      .from("api_usage_logs")
      .select("service_name, category, created_at, success, response_time_ms")
      .order("created_at", { ascending: false })
      .limit(100);

    // Get rate limits data
    const { data: rateLimits, error: limitsError } = await supabaseAdmin
      .from("api_rate_limits")
      .select("*");

    // Transform the data to include only what's needed for the frontend
    const apiKeysStatus = apiKeys?.map(key => ({
      id: key.id,
      serviceName: key.service_name,
      category: key.category,
      baseUrl: key.base_url,
      isConfigured: key.api_key !== null && key.api_key !== '',
      isActive: key.status === 'active',
      lastValidated: key.last_validated
    })) || [];

    // Group by category for easier frontend rendering
    const apiKeysByCategory = {};
    apiKeysStatus.forEach(key => {
      if (!apiKeysByCategory[key.category]) {
        apiKeysByCategory[key.category] = [];
      }
      apiKeysByCategory[key.category].push(key);
    });

    // Prepare function mapping data
    const functionMappingData = functionMappings || [];

    // Prepare usage stats if available
    const usageStats = {
      byService: {},
      byCategory: {},
    };

    if (apiUsage && apiUsage.length > 0) {
      // Process usage data for frontend display
      apiUsage.forEach(log => {
        // Track by service
        if (!usageStats.byService[log.service_name]) {
          usageStats.byService[log.service_name] = {
            totalCalls: 0,
            successfulCalls: 0,
            avgResponseTime: 0,
            responseTimes: []
          };
        }
        const serviceStats = usageStats.byService[log.service_name];
        serviceStats.totalCalls++;
        if (log.success) serviceStats.successfulCalls++;
        if (log.response_time_ms) serviceStats.responseTimes.push(log.response_time_ms);
        
        // Track by category
        if (!usageStats.byCategory[log.category]) {
          usageStats.byCategory[log.category] = {
            totalCalls: 0,
            successfulCalls: 0
          };
        }
        const categoryStats = usageStats.byCategory[log.category];
        categoryStats.totalCalls++;
        if (log.success) categoryStats.successfulCalls++;
      });
      
      // Calculate averages
      Object.values(usageStats.byService).forEach((stats: any) => {
        if (stats.responseTimes.length > 0) {
          stats.avgResponseTime = stats.responseTimes.reduce((sum: number, time: number) => sum + time, 0) / stats.responseTimes.length;
        }
        delete stats.responseTimes; // Don't need to send the raw data
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          apiKeysByCategory,
          functionMappings: functionMappingData,
          usageStats: usageStats,
          rateLimits: rateLimits || []
        }
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
