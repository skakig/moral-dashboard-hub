
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
    console.log("Starting database tables initialization");
    
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
    
    // First check if we need to create PostgreSQL functions for checking tables
    await createPostgresUtilityFunctions(supabaseAdmin);
    
    // Create the required tables if they don't exist
    const tableCreationResults = await createRequiredTables(supabaseAdmin);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Database tables initialized successfully",
        results: tableCreationResults
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Exception during database initialization:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to initialize database tables"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function createPostgresUtilityFunctions(supabaseAdmin) {
  try {
    // Create function to check if a table exists
    const { error: checkTableFnError } = await supabaseAdmin.rpc('check_table_exists', { 
      table_name: 'api_keys' 
    }).catch(async () => {
      // If the function doesn't exist, create it
      console.log("Creating check_table_exists function");
      return await supabaseAdmin.rpc('create_db_enum_function');
    });

    if (checkTableFnError) {
      console.log("Creating utility database functions");
      
      // Direct SQL execution to create the utility functions
      const { error } = await supabaseAdmin.rpc('create_db_enum_function');
      
      if (error) {
        console.error("Error creating database utility functions:", error);
        
        // Try a direct SQL approach as fallback
        try {
          await supabaseAdmin.from('_sql_execution').insert({
            query: `
              -- Function to check if a table exists
              CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
              RETURNS boolean
              LANGUAGE plpgsql
              AS $$
              BEGIN
                RETURN EXISTS (
                  SELECT FROM information_schema.tables 
                  WHERE table_schema = 'public'
                  AND table_name = check_table_exists.table_name
                );
              END;
              $$;

              -- Function to check if a column exists in a table
              CREATE OR REPLACE FUNCTION public.check_column_exists(table_name text, column_name text)
              RETURNS boolean
              LANGUAGE plpgsql
              AS $$
              BEGIN
                RETURN EXISTS (
                  SELECT FROM information_schema.columns
                  WHERE table_schema = 'public'
                  AND table_name = check_column_exists.table_name
                  AND column_name = check_column_exists.column_name
                );
              END;
              $$;
            `
          });
          
          console.log("Created utility functions using direct SQL");
        } catch (directError) {
          console.error("Failed to create utility functions using direct SQL:", directError);
          throw new Error("Failed to create database utility functions");
        }
      }
    }
  } catch (error) {
    console.error("Error creating utility functions:", error);
  }
}

async function createRequiredTables(supabaseAdmin) {
  const results = {};
  
  // Define the tables and their creation SQL
  const tableDefinitions = {
    'api_keys': `
      CREATE TABLE IF NOT EXISTS public.api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_name TEXT NOT NULL,
        api_key TEXT NOT NULL,
        category TEXT,
        is_primary BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'active',
        is_active BOOLEAN DEFAULT true,
        validation_errors TEXT[],
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        last_validated TIMESTAMPTZ,
        base_url TEXT DEFAULT ''
      );
      
      -- Create trigger for updated_at
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_api_keys'
        ) THEN
          CREATE TRIGGER set_timestamp_api_keys
          BEFORE UPDATE ON public.api_keys
          FOR EACH ROW
          EXECUTE FUNCTION update_api_key_updated_at();
        END IF;
      END
      $$;
    `,
    'site_settings': `
      CREATE TABLE IF NOT EXISTS public.site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_name TEXT NOT NULL,
        admin_email TEXT NOT NULL,
        timezone TEXT DEFAULT 'utc',
        maintenance_mode BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Create trigger for updated_at
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_settings_timestamp'
        ) THEN
          CREATE TRIGGER update_site_settings_timestamp
          BEFORE UPDATE ON public.site_settings
          FOR EACH ROW
          EXECUTE FUNCTION update_site_settings_updated_at();
        END IF;
      END
      $$;
    `,
    'api_rate_limits': `
      CREATE TABLE IF NOT EXISTS public.api_rate_limits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_name TEXT NOT NULL,
        current_hourly_usage INTEGER DEFAULT 0,
        current_daily_usage INTEGER DEFAULT 0,
        current_monthly_usage INTEGER DEFAULT 0,
        hourly_limit INTEGER DEFAULT 100,
        daily_limit INTEGER DEFAULT 1000,
        monthly_limit INTEGER DEFAULT 10000,
        last_reset_hourly TIMESTAMPTZ DEFAULT now(),
        last_reset_daily TIMESTAMPTZ DEFAULT now(),
        last_reset_monthly TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `,
    'api_function_mapping': `
      CREATE TABLE IF NOT EXISTS public.api_function_mapping (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        function_name TEXT NOT NULL,
        service_name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        parameters JSONB,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `,
    'api_usage_logs': `
      CREATE TABLE IF NOT EXISTS public.api_usage_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_name TEXT NOT NULL,
        function_name TEXT,
        success BOOLEAN DEFAULT false,
        error_message TEXT,
        request_data JSONB,
        response_data JSONB,
        response_time_ms INTEGER,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `
  };

  // Define the functions that need to be created
  const functionDefinitions = {
    'update_api_key_updated_at': `
      CREATE OR REPLACE FUNCTION public.update_api_key_updated_at()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$;
    `,
    'update_site_settings_updated_at': `
      CREATE OR REPLACE FUNCTION public.update_site_settings_updated_at()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$;
    `
  };

  // Create necessary functions first
  for (const [functionName, sql] of Object.entries(functionDefinitions)) {
    try {
      // Check if function exists
      const { data: functionExists, error: functionCheckError } = await supabaseAdmin
        .from('_sql_execution')
        .insert({
          query: `
            SELECT 1 FROM pg_proc 
            WHERE proname = '${functionName}'
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
          `
        });
      
      if (functionCheckError) {
        console.error(`Error checking if function ${functionName} exists:`, functionCheckError);
        results[`function_${functionName}`] = { success: false, error: functionCheckError.message };
        continue;
      }
      
      // If function doesn't exist or result is empty, create it
      if (!functionExists || functionExists.length === 0) {
        const { error: createFunctionError } = await supabaseAdmin
          .from('_sql_execution')
          .insert({
            query: sql
          });
        
        if (createFunctionError) {
          console.error(`Error creating function ${functionName}:`, createFunctionError);
          results[`function_${functionName}`] = { success: false, error: createFunctionError.message };
        } else {
          console.log(`Created function ${functionName}`);
          results[`function_${functionName}`] = { success: true };
        }
      } else {
        console.log(`Function ${functionName} already exists`);
        results[`function_${functionName}`] = { success: true, exists: true };
      }
    } catch (error) {
      console.error(`Exception creating function ${functionName}:`, error);
      results[`function_${functionName}`] = { success: false, error: error.message };
    }
  }

  // Try to create each table
  for (const [tableName, sql] of Object.entries(tableDefinitions)) {
    try {
      // Try to use RPC to check if table exists
      let tableExists = false;
      try {
        const { data, error } = await supabaseAdmin.rpc('check_table_exists', { table_name: tableName });
        if (!error && data) {
          tableExists = data;
        }
      } catch (rpcError) {
        console.error(`RPC check_table_exists failed for ${tableName}:`, rpcError);
        
        // Fallback: Direct SQL to check if table exists
        try {
          const { data, error } = await supabaseAdmin
            .from('_sql_execution')
            .insert({
              query: `
                SELECT EXISTS (
                  SELECT FROM information_schema.tables 
                  WHERE table_schema = 'public'
                  AND table_name = '${tableName}'
                )
              `
            });
          
          if (!error && data && data[0] && data[0].exists) {
            tableExists = data[0].exists;
          }
        } catch (sqlError) {
          console.error(`SQL check table exists failed for ${tableName}:`, sqlError);
          
          // Last fallback: try to select from the table
          try {
            const { error: selectError } = await supabaseAdmin
              .from(tableName)
              .select('id')
              .limit(1);
            
            tableExists = !selectError;
          } catch (selectError) {
            tableExists = false;
          }
        }
      }
      
      // If table doesn't exist, create it
      if (!tableExists) {
        const { error } = await supabaseAdmin
          .from('_sql_execution')
          .insert({
            query: sql
          });
        
        if (error) {
          console.error(`Error creating table ${tableName}:`, error);
          results[tableName] = { success: false, error: error.message };
        } else {
          console.log(`Created table ${tableName}`);
          results[tableName] = { success: true };
        }
      } else {
        console.log(`Table ${tableName} already exists`);
        results[tableName] = { success: true, exists: true };
      }
    } catch (error) {
      console.error(`Exception creating table ${tableName}:`, error);
      results[tableName] = { success: false, error: error.message };
    }
  }
  
  return results;
}
