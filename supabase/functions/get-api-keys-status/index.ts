
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

    // 3. Fetch API usage stats (simplified for now)
    const usageStats = {
      byService: {},
      byCategory: {}
    };

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
        apiKeysByCategory[category].push(key);
      });
    }

    // Return the complete API status data
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          apiKeysByCategory,
          functionMappings: functionMappings || [],
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
