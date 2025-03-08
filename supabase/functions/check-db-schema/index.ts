
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
    console.log("Starting database schema check");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Define a list of required columns for each table
    const requiredColumns = {
      'api_keys': ['id', 'service_name', 'api_key', 'category', 'is_primary', 'status', 'is_active'],
      'site_settings': ['id', 'site_name', 'admin_email', 'timezone', 'maintenance_mode']
    };
    
    const results: Record<string, Record<string, boolean>> = {};
    
    // Check each table for required columns
    for (const [table, columns] of Object.entries(requiredColumns)) {
      results[table] = {};
      
      for (const column of columns) {
        const { data: exists, error } = await supabaseAdmin.rpc('check_column_exists', {
          table_name: table,
          column_name: column
        });
        
        if (error) {
          console.error(`Error checking ${table}.${column}:`, error);
          results[table][column] = false;
        } else {
          results[table][column] = !!exists;
        }
      }
    }
    
    // Count the number of missing columns
    let missingColumns = 0;
    for (const table of Object.keys(results)) {
      for (const column of Object.keys(results[table])) {
        if (!results[table][column]) {
          missingColumns++;
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        schema: results,
        missingColumns,
        message: missingColumns > 0 
          ? `Schema check completed - ${missingColumns} missing columns found` 
          : "Schema check completed - all required columns exist"
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
