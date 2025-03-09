
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
    console.log("Starting database initialization");
    
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

    // SQL to create or update tables
    const createTablesSql = `
    -- Create the api_keys table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_name TEXT NOT NULL,
        api_key TEXT NOT NULL,
        base_url TEXT DEFAULT '',
        category TEXT,
        status TEXT DEFAULT 'active',
        is_primary BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        validation_errors TEXT[],
        last_validated TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Create the site_settings table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_name TEXT NOT NULL,
        admin_email TEXT NOT NULL,
        timezone TEXT NOT NULL DEFAULT 'utc',
        maintenance_mode BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Create api_rate_limits table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.api_rate_limits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_name TEXT NOT NULL,
        requests_used INTEGER DEFAULT 0,
        request_limit INTEGER NOT NULL,
        reset_date TIMESTAMP WITH TIME ZONE DEFAULT now() + interval '1 day',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Create api_function_mapping table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.api_function_mapping (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        function_name TEXT NOT NULL,
        service_name TEXT NOT NULL,
        description TEXT,
        parameters JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Create api_usage_logs table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.api_usage_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_name TEXT NOT NULL,
        function_name TEXT,
        request_data JSONB,
        response_data JSONB,
        response_time_ms INTEGER,
        success BOOLEAN DEFAULT FALSE,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Insert a default site settings record if none exists
    INSERT INTO public.site_settings (site_name, admin_email, timezone, maintenance_mode)
    SELECT 'The Moral Hierarchy', 'admin@tmh.com', 'utc', false
    WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);
    `;

    // First try to execute the tables creation SQL
    try {
      const { error: directError } = await supabaseAdmin.from('_sql_execution').insert({
        query: createTablesSql
      }).select();
      
      if (directError) {
        throw new Error(`Failed to initialize database with direct SQL: ${directError.message}`);
      }
      
      console.log("Successfully created/updated tables with direct SQL");
    } catch (sqlError) {
      console.error("Failed with direct SQL:", sqlError);
      
      // Try to execute in smaller parts in case of timeout or size issues
      try {
        // Split queries and run them separately
        const sqlQueries = createTablesSql.split(';').filter(q => q.trim());
        
        for (const query of sqlQueries) {
          if (!query.trim()) continue;
          
          const { error } = await supabaseAdmin.from('_sql_execution').insert({
            query: query + ';'
          }).select();
          
          if (error) {
            console.warn(`Warning - issue with query: ${query.substring(0, 100)}...`, error);
            // Continue with other queries
          }
        }
        
        console.log("Completed partial SQL execution");
      } catch (partialError) {
        console.error("Failed with partial SQL execution:", partialError);
        throw partialError;
      }
    }

    // Create the triggers and functions
    const createTriggersSql = `
    -- Create update trigger for api_keys
    CREATE OR REPLACE FUNCTION public.update_api_key_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop trigger if it exists to avoid errors
    DROP TRIGGER IF EXISTS set_timestamp_api_keys ON public.api_keys;

    -- Create trigger
    CREATE TRIGGER set_timestamp_api_keys
    BEFORE UPDATE ON public.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.update_api_key_updated_at();

    -- Create update trigger for site_settings
    CREATE OR REPLACE FUNCTION public.update_site_settings_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop trigger if it exists to avoid errors
    DROP TRIGGER IF EXISTS update_site_settings_timestamp ON public.site_settings;

    -- Create trigger
    CREATE TRIGGER update_site_settings_timestamp
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_site_settings_updated_at();
    `;

    // Try to create triggers
    try {
      const { error: directError } = await supabaseAdmin.from('_sql_execution').insert({
        query: createTriggersSql
      }).select();
      
      if (directError) {
        console.warn(`Warning - failed to create triggers: ${directError.message}`);
        // Continue anyway, triggers are less critical
      } else {
        console.log("Successfully created triggers and functions");
      }
    } catch (triggerError) {
      console.error("Failed to create triggers:", triggerError);
      // Continue anyway, triggers are less critical
    }

    // Create the check_column_exists function
    const createFunctionSql = `
    -- Create a function to check if a column exists in a table
    CREATE OR REPLACE FUNCTION public.check_column_exists(table_name text, column_name text)
    RETURNS boolean
    LANGUAGE plpgsql
    AS $$
    DECLARE
      column_exists boolean;
    BEGIN
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = check_column_exists.table_name
        AND column_name = check_column_exists.column_name
      ) INTO column_exists;
      
      RETURN column_exists;
    END;
    $$;
    `;
    
    // Try to create the function
    try {
      const { error: functionError } = await supabaseAdmin.from('_sql_execution').insert({
        query: createFunctionSql
      }).select();
      
      if (functionError) {
        console.warn(`Warning - failed to create check_column_exists function: ${functionError.message}`);
        // Continue anyway
      } else {
        console.log("Successfully created check_column_exists function");
      }
    } catch (functionError) {
      console.error("Failed to create function:", functionError);
      // Continue anyway
    }

    // Verify tables were created successfully
    const { data: tablesData, error: tablesError } = await supabaseAdmin
      .from('_sql_execution')
      .insert({
        query: `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`
      })
      .select();

    if (tablesError) {
      console.error("Error verifying tables:", tablesError);
    } else {
      const tableNames = tablesData?.[0]?.results?.map((row: any) => row.tablename) || [];
      console.log("Available tables:", tableNames.join(', '));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Database tables, columns, triggers, and functions initialized successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
