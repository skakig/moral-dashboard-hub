
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
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the platform from the request
    const { platform } = await req.json();

    // Fetch sharing options from the database
    const { data: sharingOptions, error } = await supabaseAdmin
      .from('sharing_options')
      .select('*')
      .eq('platform', platform)
      .single();

    if (error) {
      // If specific platform options not found, get default options
      const { data: defaultOptions, error: defaultError } = await supabaseAdmin
        .from('sharing_options')
        .select('*')
        .eq('platform', 'default')
        .single();

      if (defaultError) {
        // Return fallback options if nothing in database
        return new Response(
          JSON.stringify({
            redirectUrl: "https://themh.io",
            additionalTags: ["TheMoralHierarchy", "TMH"],
            message: "Check out this meme from The Moral Hierarchy"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(defaultOptions),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(sharingOptions),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Exception:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        redirectUrl: "https://themh.io",
        additionalTags: ["TheMoralHierarchy", "TMH"],
        message: "Check out this meme from The Moral Hierarchy" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
