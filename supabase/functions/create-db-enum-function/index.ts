
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
    // First, try direct SQL execution to create the functions
    const createFunctionsQuery = `
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
      RETURNS SETOF RECORD
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY EXECUTE sql;
      EXCEPTION
        WHEN others THEN
          RAISE EXCEPTION 'Error executing SQL: %', SQLERRM;
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
    `;

    // Execute the SQL directly
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: createFunctionsQuery });
    
    if (error) {
      // If the first attempt fails, try creating functions individually via direct SQL
      console.error('Error creating SQL functions through RPC:', error);
      
      // Use direct SQL execution as fallback
      const { error: directError } = await supabaseAdmin.from('_sql_execution').insert({
        query: createFunctionsQuery
      }).select();

      if (directError) {
        console.error('Fallback direct SQL execution failed:', directError);
        return new Response(
          JSON.stringify({ error: "Failed to create database functions: " + directError.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
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
