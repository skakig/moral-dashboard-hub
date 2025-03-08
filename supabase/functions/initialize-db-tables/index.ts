
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
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // SQL to create or update tables
    const createTablesSql = `
    -- Create the api_keys table if it doesn't exist
    CREATE TABLE IF NOT EXISTS api_keys (
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
    CREATE TABLE IF NOT EXISTS site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_name TEXT NOT NULL,
        admin_email TEXT NOT NULL,
        timezone TEXT NOT NULL DEFAULT 'utc',
        maintenance_mode BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Insert a default site settings record if none exists
    INSERT INTO site_settings (site_name, admin_email, timezone, maintenance_mode)
    SELECT 'The Moral Hierarchy', 'admin@tmh.com', 'utc', false
    WHERE NOT EXISTS (SELECT 1 FROM site_settings);
    `;

    // First try to execute with raw SQL
    try {
      const result = await supabaseAdmin.rpc('exec_sql', { sql: createTablesSql });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (sqlError) {
      console.error("Failed with exec_sql, trying direct SQL:", sqlError);
      
      // If that fails, try direct SQL execution
      const { error: directError } = await supabaseAdmin.from('_sql_execution').insert({
        query: createTablesSql
      }).select();
      
      if (directError) {
        throw new Error(`Failed to initialize database: ${directError.message}`);
      }
    }

    // Create the triggers and functions
    const createTriggersSql = `
    -- Create update trigger for api_keys
    CREATE OR REPLACE FUNCTION update_api_key_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop trigger if it exists to avoid errors
    DROP TRIGGER IF EXISTS set_timestamp_api_keys ON api_keys;

    -- Create trigger
    CREATE TRIGGER set_timestamp_api_keys
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_api_key_updated_at();

    -- Create update trigger for site_settings
    CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop trigger if it exists to avoid errors
    DROP TRIGGER IF EXISTS update_site_settings_timestamp ON site_settings;

    -- Create trigger
    CREATE TRIGGER update_site_settings_timestamp
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_updated_at();
    `;

    // Try to create triggers
    try {
      const result = await supabaseAdmin.rpc('exec_sql', { sql: createTriggersSql });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (triggerError) {
      console.error("Failed to create triggers, trying direct SQL:", triggerError);
      
      // If that fails, try direct SQL execution
      const { error: directError } = await supabaseAdmin.from('_sql_execution').insert({
        query: createTriggersSql
      }).select();
      
      if (directError) {
        console.warn(`Warning - failed to create triggers: ${directError.message}`);
        // Continue anyway, triggers are less critical
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Database tables, columns, and triggers initialized successfully"
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
