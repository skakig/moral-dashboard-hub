
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
      headers: {
        ...corsHeaders,
      },
    });
  }

  try {
    // Initialize Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Fetching API keys status...");

    // 1. Fetch API keys
    const { data: apiKeys, error: apiKeysError } = await supabaseAdmin
      .from("api_keys")
      .select("*")
      .order("service_name");

    if (apiKeysError) {
      console.error("Error fetching API keys:", apiKeysError);
      throw new Error(`Failed to fetch API keys: ${apiKeysError.message}`);
    }

    console.log(`Retrieved ${apiKeys?.length || 0} API keys`);

    // 2. Fetch API function mappings
    const { data: functionMappings, error: mappingsError } = await supabaseAdmin
      .from("api_function_mapping")
      .select("*")
      .order("function_name");

    if (mappingsError) {
      console.log("Error fetching function mappings:", mappingsError);
      // Continue without mappings instead of failing completely
    } else {
      console.log(`Retrieved ${functionMappings?.length || 0} function mappings`);
    }

    // 3. Fetch API usage stats
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from("api_usage_logs")
      .select("service_name, success, response_time_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
      
    if (usageError) {
      console.log("Error fetching usage stats:", usageError);
      // Continue without usage stats
    }
    
    // Process usage stats
    const usageStats = {
      byService: {},
      byCategory: {},
      recentCalls: usageData || []
    };
    
    if (usageData && usageData.length > 0) {
      // Group by service
      usageData.forEach(log => {
        const service = log.service_name;
        if (!usageStats.byService[service]) {
          usageStats.byService[service] = {
            total: 0,
            success: 0,
            failed: 0,
            avgResponseTime: 0
          };
        }
        
        usageStats.byService[service].total++;
        if (log.success) {
          usageStats.byService[service].success++;
        } else {
          usageStats.byService[service].failed++;
        }
        
        // Update average response time
        const currentTotal = usageStats.byService[service].avgResponseTime * (usageStats.byService[service].total - 1);
        const newAvg = (currentTotal + (log.response_time_ms || 0)) / usageStats.byService[service].total;
        usageStats.byService[service].avgResponseTime = newAvg;
      });
      
      // Find the associated category for each service
      if (apiKeys && apiKeys.length > 0) {
        const serviceToCategory = {};
        apiKeys.forEach(key => {
          serviceToCategory[key.service_name] = key.category;
        });
        
        // Group by category
        Object.keys(usageStats.byService).forEach(service => {
          const category = serviceToCategory[service] || 'Uncategorized';
          if (!usageStats.byCategory[category]) {
            usageStats.byCategory[category] = {
              total: 0,
              success: 0,
              failed: 0,
              services: {}
            };
          }
          
          usageStats.byCategory[category].total += usageStats.byService[service].total;
          usageStats.byCategory[category].success += usageStats.byService[service].success;
          usageStats.byCategory[category].failed += usageStats.byService[service].failed;
          usageStats.byCategory[category].services[service] = usageStats.byService[service];
        });
      }
    }

    // 4. Fetch API rate limits
    const { data: rateLimits, error: limitsError } = await supabaseAdmin
      .from("api_rate_limits")
      .select("*")
      .order("service_name");

    if (limitsError) {
      console.log("Error fetching rate limits:", limitsError);
      // Continue without rate limits instead of failing completely
    } else {
      console.log(`Retrieved ${rateLimits?.length || 0} rate limits`);
    }

    // 5. Organize API keys by category
    const apiKeysByCategory = {};
    if (apiKeys && apiKeys.length > 0) {
      apiKeys.forEach(key => {
        const category = key.category || "Uncategorized";
        if (!apiKeysByCategory[category]) {
          apiKeysByCategory[category] = [];
        }
        
        // Format the API key for frontend consumption
        apiKeysByCategory[category].push({
          id: key.id,
          serviceName: key.service_name,
          baseUrl: key.base_url,
          isConfigured: true,
          isActive: key.status === 'active',
          isPrimary: key.is_primary || false,
          lastValidated: key.last_validated,
          createdAt: key.created_at,
          category: key.category,
          validationErrors: key.validation_errors || []
        });
      });
    }

    // 6. Format function mappings for frontend
    const formattedMappings = functionMappings?.map(mapping => ({
      id: mapping.id,
      function_name: mapping.function_name,
      preferred_service: mapping.preferred_service,
      fallback_service: mapping.fallback_service,
      description: mapping.description,
      updated_at: mapping.updated_at
    })) || [];

    // Return the complete API status data
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          apiKeysByCategory,
          functionMappings: formattedMappings,
          usageStats,
          rateLimits: rateLimits || []
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("Error in get-api-keys-status:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to fetch API keys status" 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500 
      }
    );
  }
});
