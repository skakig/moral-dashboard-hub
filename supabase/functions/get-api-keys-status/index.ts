
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
function initSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Fetch API keys from database
async function fetchApiKeys(supabase) {
  console.log("Fetching API keys...");
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .order("service_name");
    
  if (error) {
    console.error("Error fetching API keys:", error);
    throw new Error(`Failed to fetch API keys: ${error.message}`);
  }
  
  console.log(`Retrieved ${data?.length || 0} API keys`);
  return data || [];
}

// Fetch function mappings from database
async function fetchFunctionMappings(supabase) {
  const { data, error } = await supabase
    .from("api_function_mapping")
    .select("*")
    .order("function_name");
    
  if (error) {
    console.log("Error fetching function mappings:", error);
    return [];
  }
  
  console.log(`Retrieved ${data?.length || 0} function mappings`);
  return data || [];
}

// Format function mappings for frontend
function formatFunctionMappings(mappings) {
  return mappings.map(mapping => ({
    id: mapping.id,
    function_name: mapping.function_name,
    preferred_service: mapping.preferred_service,
    fallback_service: mapping.fallback_service,
    description: mapping.description,
    updated_at: mapping.updated_at
  }));
}

// Fetch API usage stats
async function fetchUsageStats(supabase) {
  const { data, error } = await supabase
    .from("api_usage_logs")
    .select("service_name, success, response_time_ms, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
      
  if (error) {
    console.log("Error fetching usage stats:", error);
    return [];
  }
  
  return data || [];
}

// Process and organize usage stats
function processUsageStats(usageData, apiKeys) {
  const usageStats = {
    byService: {},
    byCategory: {},
    recentCalls: usageData || []
  };
  
  if (usageData && usageData.length > 0) {
    // Process stats by service
    processStatsByService(usageData, usageStats);
    
    // Process stats by category
    if (apiKeys && apiKeys.length > 0) {
      processStatsByCategory(usageStats, apiKeys);
    }
  }
  
  return usageStats;
}

// Process usage statistics by service
function processStatsByService(usageData, usageStats) {
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
}

// Process usage statistics by category
function processStatsByCategory(usageStats, apiKeys) {
  // Create service to category mapping
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

// Fetch API rate limits
async function fetchRateLimits(supabase) {
  const { data, error } = await supabase
    .from("api_rate_limits")
    .select("*")
    .order("service_name");

  if (error) {
    console.log("Error fetching rate limits:", error);
    return [];
  }
  
  console.log(`Retrieved ${data?.length || 0} rate limits`);
  return data || [];
}

// Format API keys for frontend consumption
function formatApiKeys(apiKeys) {
  // Organize API keys by category
  const apiKeysByCategory = {};
  
  if (apiKeys && apiKeys.length > 0) {
    apiKeys.forEach(key => {
      const category = key.category || "Uncategorized";
      if (!apiKeysByCategory[category]) {
        apiKeysByCategory[category] = [];
      }
      
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
  
  return apiKeysByCategory;
}

// Main handler function
async function handleRequest(req) {
  try {
    // Initialize Supabase client
    const supabaseAdmin = initSupabaseClient();
    console.log("Fetching API keys status...");

    // 1. Fetch all required data
    const apiKeys = await fetchApiKeys(supabaseAdmin);
    const functionMappings = await fetchFunctionMappings(supabaseAdmin);
    const usageData = await fetchUsageStats(supabaseAdmin);
    const rateLimits = await fetchRateLimits(supabaseAdmin);
    
    // 2. Process and format data
    const apiKeysByCategory = formatApiKeys(apiKeys);
    const formattedMappings = formatFunctionMappings(functionMappings);
    const usageStats = processUsageStats(usageData, apiKeys);

    // 3. Return the complete API status data
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
}

// Define the actual server handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...corsHeaders,
      },
    });
  }

  return handleRequest(req);
});
