
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { initSupabaseClient } from "./client.ts";
import { fetchApiKeys, formatApiKeys } from "./api-keys.ts";
import { fetchFunctionMappings, formatFunctionMappings } from "./function-mappings.ts";
import { fetchUsageStats, processUsageStats } from "./usage-stats.ts";
import { fetchRateLimits } from "./rate-limits.ts";

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
      headers: corsHeaders,
    });
  }

  return handleRequest(req);
});
