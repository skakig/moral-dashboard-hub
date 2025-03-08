
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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create helpful database functions
    const { error } = await supabaseAdmin.rpc('exec_sql', { 
      sql: `
      -- Function to get enum values
      CREATE OR REPLACE FUNCTION get_enum_values(enum_name text)
      RETURNS TABLE (enum_value text) 
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        query text;
      BEGIN
        query := 'SELECT unnest(enum_range(NULL::' || enum_name || '))::text AS enum_value';
        RETURN QUERY EXECUTE query;
      EXCEPTION
        WHEN others THEN
          RAISE NOTICE 'Error getting enum values: %', SQLERRM;
          RETURN;
      END;
      $$;
      
      -- Function to execute SQL
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
      
      -- Function to check if a column exists in a table
      CREATE OR REPLACE FUNCTION check_column_exists(
        table_name text,
        column_name text
      )
      RETURNS boolean
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        column_exists boolean;
      BEGIN
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = $1 AND column_name = $2
        ) INTO column_exists;
        
        RETURN column_exists;
      END;
      $$;
      `
    });
    
    if (error) {
      console.error('Error creating SQL functions:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "SQL helper functions created successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Exception:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
