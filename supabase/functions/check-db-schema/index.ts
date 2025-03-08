
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

    // First check if the exec_sql function exists
    const checkFunctionQuery = `
      SELECT EXISTS (
        SELECT 1 
        FROM pg_proc 
        JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
        WHERE proname = 'exec_sql' AND pg_namespace.nspname = 'public'
      ) as function_exists;
    `;
    
    // Direct SQL query to check if function exists
    const { data: functionData, error: functionError } = await supabaseAdmin.from('_sql_execution').insert({
      query: checkFunctionQuery
    }).select();
    
    const execSqlExists = !functionError && functionData && functionData[0]?.results?.[0]?.function_exists === true;
    
    if (!execSqlExists) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          schema: {},
          missingColumns: 1, // Signal that initialization is needed
          message: "The exec_sql function is missing and needs to be created"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Define a list of required columns for each table
    const requiredColumns = {
      'api_keys': ['id', 'service_name', 'api_key', 'category', 'is_primary', 'status', 'is_active', 'validation_errors'],
      'site_settings': ['id', 'site_name', 'admin_email', 'timezone', 'maintenance_mode']
    };
    
    const results: Record<string, Record<string, boolean>> = {};
    let missingColumns = 0;
    
    // Check each table for required columns
    for (const [table, columns] of Object.entries(requiredColumns)) {
      results[table] = {};
      
      // First check if the table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_name = '${table}'
        ) as table_exists;
      `;
      
      try {
        const { data: tableExists, error: tableError } = await supabaseAdmin.rpc('exec_sql', { 
          sql: tableExistsQuery
        });
        
        const tableExistsResult = !tableError && tableExists && tableExists[0]?.table_exists === true;
        
        if (!tableExistsResult) {
          // If table doesn't exist, mark all columns as missing
          for (const column of columns) {
            results[table][column] = false;
            missingColumns++;
          }
          continue;
        }
      } catch (error) {
        console.error(`Error checking if table ${table} exists:`, error);
        // Assume table is missing if we can't check
        for (const column of columns) {
          results[table][column] = false;
          missingColumns++;
        }
        continue;
      }
      
      // Table exists, now check columns
      for (const column of columns) {
        try {
          const { data: exists, error } = await supabaseAdmin.rpc('check_column_exists', {
            table_name: table,
            column_name: column
          });
          
          if (error) {
            console.error(`Error checking ${table}.${column}:`, error);
            results[table][column] = false;
            missingColumns++;
          } else {
            results[table][column] = !!exists;
            if (!exists) missingColumns++;
          }
        } catch (error) {
          console.error(`Exception checking ${table}.${column}:`, error);
          results[table][column] = false;
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
      JSON.stringify({ 
        success: false, 
        error: error.message,
        // Signal that something is wrong - needs initialization
        missingColumns: 1
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
