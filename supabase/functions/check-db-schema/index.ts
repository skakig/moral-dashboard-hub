
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
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error: Missing environment variables",
          missingColumns: 1 // Signal initialization is needed
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if tables exist first
    const tables = ['api_keys', 'site_settings', 'api_rate_limits', 'api_function_mapping', 'api_usage_logs'];
    let missingTables = 0;
    let missingTableNames = [];
    
    for (const table of tables) {
      const { data, error } = await supabaseAdmin
        .from('_sql_execution')
        .insert({
          query: `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = '${table}'
          );`
        })
        .select();
      
      if (error) {
        console.error(`Error checking if table ${table} exists:`, error);
        missingTables++;
        missingTableNames.push(table);
        continue;
      }
      
      if (data && data[0]?.results?.[0]?.exists === false) {
        console.log(`Table ${table} does not exist`);
        missingTables++;
        missingTableNames.push(table);
      }
    }
    
    if (missingTables > 0) {
      console.log(`${missingTables} tables need to be created: ${missingTableNames.join(', ')}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          schema: {},
          missingColumns: missingTables,
          missingTables: missingTableNames,
          message: `${missingTables} tables are missing and need to be created: ${missingTableNames.join(', ')}`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Define a list of required columns for each table
    const requiredColumns = {
      'api_keys': ['id', 'service_name', 'api_key', 'category', 'is_primary', 'status', 'is_active', 'validation_errors', 'created_at', 'updated_at'],
      'site_settings': ['id', 'site_name', 'admin_email', 'timezone', 'maintenance_mode', 'created_at', 'updated_at'],
      'api_rate_limits': ['id', 'service_name', 'requests_used', 'request_limit', 'reset_date', 'created_at', 'updated_at'],
      'api_function_mapping': ['id', 'function_name', 'service_name', 'description', 'is_active', 'created_at', 'updated_at'],
      'api_usage_logs': ['id', 'service_name', 'function_name', 'success', 'created_at']
    };
    
    const results: Record<string, Record<string, boolean>> = {};
    let missingColumns = 0;
    let missingColumnDetails: Record<string, string[]> = {};
    
    // Check each table for required columns
    for (const [table, columns] of Object.entries(requiredColumns)) {
      results[table] = {};
      missingColumnDetails[table] = [];
      
      for (const column of columns) {
        const { data, error } = await supabaseAdmin
          .from('_sql_execution')
          .insert({
            query: `SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = 'public'
              AND table_name = '${table}'
              AND column_name = '${column}'
            );`
          })
          .select();
        
        if (error) {
          console.error(`Error checking column ${table}.${column}:`, error);
          results[table][column] = false;
          missingColumns++;
          missingColumnDetails[table].push(column);
          continue;
        }
        
        if (data && data[0]?.results?.[0]?.exists === false) {
          console.log(`Column ${table}.${column} does not exist`);
          results[table][column] = false;
          missingColumns++;
          missingColumnDetails[table].push(column);
        } else {
          results[table][column] = true;
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        schema: results,
        missingColumns,
        missingColumnDetails,
        message: missingColumns > 0 
          ? `Schema check completed - ${missingColumns} missing columns found` 
          : "Schema check completed - all required columns exist"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        missingColumns: 1 // Signal that something is wrong - needs initialization
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
