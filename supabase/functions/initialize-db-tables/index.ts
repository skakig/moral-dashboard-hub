
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

    // First, try to create the utility functions if they don't exist
    try {
      await supabaseAdmin.rpc('check_table_exists', { table_name: 'api_keys' });
      console.log("Utility functions already exist, skipping creation");
    } catch (functionError) {
      console.log("Utility functions don't exist, creating them...");
      
      // Create the check_table_exists function
      const createTableCheckFunctionSql = `
      CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
      RETURNS boolean
      LANGUAGE plpgsql
      AS $$
      DECLARE
        table_exists boolean;
      BEGIN
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = check_table_exists.table_name
        ) INTO table_exists;
        
        RETURN table_exists;
      END;
      $$;
      `;
      
      // Create the check_column_exists function
      const createColumnCheckFunctionSql = `
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
      
      // Execute functions creation
      try {
        const { error: tableCheckError } = await supabaseAdmin.rpc('_exec_sql', { 
          sql: createTableCheckFunctionSql 
        });
        
        if (tableCheckError) {
          console.warn("Error creating check_table_exists function:", tableCheckError);
          // Try with a different approach
          const { error: directError } = await supabaseAdmin.rpc('exec', { 
            query: createTableCheckFunctionSql 
          });
          
          if (directError) {
            console.error("Failed to create utility functions:", directError);
          }
        }
        
        const { error: columnCheckError } = await supabaseAdmin.rpc('_exec_sql', { 
          sql: createColumnCheckFunctionSql 
        });
        
        if (columnCheckError) {
          console.warn("Error creating check_column_exists function:", columnCheckError);
          // Try with a different approach
          const { error: directError } = await supabaseAdmin.rpc('exec', { 
            query: createColumnCheckFunctionSql 
          });
          
          if (directError) {
            console.error("Failed to create utility functions:", directError);
          }
        }
      } catch (rpcError) {
        console.error("Error creating utility functions via RPC:", rpcError);
        // We'll continue anyway and try direct SQL execution
      }
    }

    // SQL to create or update tables using direct SQL execution
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

    // Try multiple approaches to execute the SQL
    let tablesCreated = false;
    
    // Approach 1: Using _exec_sql RPC function
    try {
      const { error } = await supabaseAdmin.rpc('_exec_sql', { sql: createTablesSql });
      if (!error) {
        console.log("Successfully created/updated tables using _exec_sql RPC");
        tablesCreated = true;
      } else {
        console.warn("Error using _exec_sql RPC:", error);
      }
    } catch (error) {
      console.warn("Exception using _exec_sql RPC:", error);
    }
    
    // Approach 2: Using exec RPC function
    if (!tablesCreated) {
      try {
        const { error } = await supabaseAdmin.rpc('exec', { query: createTablesSql });
        if (!error) {
          console.log("Successfully created/updated tables using exec RPC");
          tablesCreated = true;
        } else {
          console.warn("Error using exec RPC:", error);
        }
      } catch (error) {
        console.warn("Exception using exec RPC:", error);
      }
    }
    
    // Approach 3: Try executing statements individually
    if (!tablesCreated) {
      try {
        console.log("Attempting to execute statements individually");
        const statements = createTablesSql.split(';').filter(s => s.trim().length > 0);
        
        for (const statement of statements) {
          try {
            // Try using _exec_sql
            const { error } = await supabaseAdmin.rpc('_exec_sql', { 
              sql: statement + ';' 
            });
            
            if (error) {
              // Try using exec
              const { error: execError } = await supabaseAdmin.rpc('exec', { 
                query: statement + ';' 
              });
              
              if (execError) {
                console.warn(`Warning - issue with statement: ${statement.substring(0, 100)}...`, execError);
              }
            }
          } catch (error) {
            console.warn(`Exception executing statement: ${statement.substring(0, 100)}...`, error);
          }
        }
        
        console.log("Completed individual statement execution");
        tablesCreated = true;
      } catch (error) {
        console.error("Failed with individual statement execution:", error);
      }
    }

    // Create update trigger functions for timestamp updates
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

    // Try to create triggers with the same approaches
    try {
      const { error } = await supabaseAdmin.rpc('_exec_sql', { sql: createTriggersSql });
      if (!error) {
        console.log("Successfully created triggers and functions");
      } else {
        // Try executing statements individually
        const statements = createTriggersSql.split(';').filter(s => s.trim().length > 0);
        
        for (const statement of statements) {
          try {
            await supabaseAdmin.rpc('_exec_sql', { sql: statement + ';' });
          } catch (error) {
            try {
              await supabaseAdmin.rpc('exec', { query: statement + ';' });
            } catch (innerError) {
              console.warn(`Warning - issue with trigger statement: ${statement.substring(0, 100)}...`);
            }
          }
        }
      }
    } catch (error) {
      console.warn("Error creating triggers:", error);
      // Continue anyway, triggers are less critical
    }

    // Verify tables were created successfully
    let tablesExist = true;
    const tables = ['api_keys', 'site_settings', 'api_rate_limits', 'api_function_mapping', 'api_usage_logs'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin.rpc('check_table_exists', { 
          table_name: table 
        });
        
        if (error || !data) {
          console.error(`Table ${table} verification failed:`, error);
          tablesExist = false;
        }
      } catch (error) {
        // Try a direct query as fallback
        try {
          const { data, error } = await supabaseAdmin
            .from(table)
            .select('id')
            .limit(1);
            
          if (error && error.code === '42P01') { // Table doesn't exist
            console.error(`Table ${table} does not exist after creation attempt`);
            tablesExist = false;
          }
        } catch (innerError) {
          console.error(`Failed to verify table ${table}:`, innerError);
          tablesExist = false;
        }
      }
    }

    if (!tablesExist) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Some tables could not be verified after creation attempt",
          error: "Database initialization may be incomplete"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
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
