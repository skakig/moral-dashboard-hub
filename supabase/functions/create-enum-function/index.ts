
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

    // Create function to get enum values
    const { error } = await supabaseAdmin.rpc('exec_sql', { 
      sql: `
      -- Create a function to get enum values
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
      `
    });
    
    if (error) {
      console.error('Error creating enum function:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Enum function created successfully" }),
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
