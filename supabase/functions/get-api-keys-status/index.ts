
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
    console.log("Starting get-api-keys-status function");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error: Missing environment variables" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fetching API keys data");
    
    // Check if api_keys table exists
    try {
      // Get all API keys with their service name and status
      const { data: apiKeys, error: apiKeysError } = await supabaseAdmin
        .from("api_keys")
        .select("id, service_name, category, base_url, status, created_at, last_validated, is_active");

      if (apiKeysError) {
        console.error("Database error (api_keys):", apiKeysError);
        return new Response(
          JSON.stringify({ success: false, error: apiKeysError.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log(`Found ${apiKeys?.length || 0} API keys`);

      // Try to get function mappings if table exists
      let functionMappings = [];
      try {
        const { data: mappings, error: mappingsError } = await supabaseAdmin
          .from("api_function_mapping")
          .select("*");

        if (!mappingsError) {
          functionMappings = mappings || [];
          console.log(`Found ${functionMappings.length} function mappings`);
        } else {
          console.log("Note: api_function_mapping table not available or error:", mappingsError.message);
        }
      } catch (err) {
        console.log("Function mappings fetch skipped:", err.message);
      }

      // Try to get API usage data if table exists
      let apiUsage = [];
      try {
        const { data: usage, error: usageError } = await supabaseAdmin
          .from("api_usage_logs")
          .select("service_name, created_at, success, response_time_ms")
          .order("created_at", { ascending: false })
          .limit(100);

        if (!usageError) {
          apiUsage = usage || [];
          console.log(`Found ${apiUsage.length} usage logs`);
        } else {
          console.log("Note: api_usage_logs table not available or error:", usageError.message);
        }
      } catch (err) {
        console.log("API usage fetch skipped:", err.message);
      }

      // Try to get rate limits data if table exists
      let rateLimits = [];
      try {
        const { data: limits, error: limitsError } = await supabaseAdmin
          .from("api_rate_limits")
          .select("*");

        if (!limitsError) {
          rateLimits = limits || [];
          console.log(`Found ${rateLimits.length} rate limits`);
        } else {
          console.log("Note: api_rate_limits table not available or error:", limitsError.message);
        }
      } catch (err) {
        console.log("Rate limits fetch skipped:", err.message);
      }

      // Categorize API keys based on service name or provided category
      const apiKeysByCategory = {};
      
      // Transform the data to include only what's needed for the frontend
      const apiKeysStatus = apiKeys?.map(key => {
        // Use the key.category field if available, otherwise derive from service name
        let category = key.category || "Other";
        
        // If category is still empty, try to derive it from service name
        if (category === "Other") {
          const serviceLower = key.service_name.toLowerCase();
          
          // Map common services to categories
          if (serviceLower.includes("openai") || serviceLower.includes("anthropic")) {
            category = "Text Generation";
          } else if (serviceLower.includes("stability") || serviceLower.includes("replicate")) {
            category = "Image Generation";
          } else if (serviceLower.includes("runway") || serviceLower.includes("pika")) {
            category = "Video Generation";
          } else if (
            serviceLower.includes("tiktok") || 
            serviceLower.includes("meta") || 
            serviceLower.includes("twitter") || 
            serviceLower.includes("facebook") ||
            serviceLower.includes("instagram") ||
            serviceLower.includes("linkedin")
          ) {
            category = "Social Media";
          }
        }

        return {
          id: key.id,
          serviceName: key.service_name,
          category: category,
          baseUrl: key.base_url,
          isConfigured: true, // If it's in the database, it's configured
          isActive: key.is_active !== false && key.status === 'active',
          lastValidated: key.last_validated
        };
      }) || [];

      // Group by category for easier frontend rendering
      apiKeysStatus.forEach(key => {
        if (!apiKeysByCategory[key.category]) {
          apiKeysByCategory[key.category] = [];
        }
        apiKeysByCategory[key.category].push(key);
      });

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
          
          // Track by category (using existing API key categories)
          const relatedKey = apiKeysStatus.find(key => key.serviceName === log.service_name);
          const category = relatedKey ? relatedKey.category : "Other";
          
          if (!usageStats.byCategory[category]) {
            usageStats.byCategory[category] = {
              totalCalls: 0,
              successfulCalls: 0
            };
          }
          const categoryStats = usageStats.byCategory[category];
          categoryStats.totalCalls++;
          if (log.success) categoryStats.successfulCalls++;
        });
        
        // Calculate averages
        Object.values(usageStats.byService).forEach((stats: any) => {
          if (stats.responseTimes?.length > 0) {
            stats.avgResponseTime = stats.responseTimes.reduce((sum: number, time: number) => sum + time, 0) / stats.responseTimes.length;
          }
          delete stats.responseTimes; // Don't need to send the raw data
        });
      }

      console.log("Successfully processed API key data");

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            apiKeysByCategory,
            functionMappings: functionMappings || [],
            usageStats: usageStats,
            rateLimits: rateLimits || []
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Database error: ${dbError.message}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Server error: ${error.message}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
