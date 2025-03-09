
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0'

interface SiteSettings {
  id: string;
  site_name: string;
  admin_email: string;
  timezone: string;
  maintenance_mode: boolean;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged-in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Process the request body
    const { id, site_name, admin_email, timezone, maintenance_mode } = await req.json() as SiteSettings

    // Validate inputs
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing settings ID" }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Update site settings with explicit updated_at timestamp
    const { data, error } = await supabaseClient
      .from('site_settings')
      .update({
        site_name,
        admin_email,
        timezone,
        maintenance_mode,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating site settings:', error)
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Return the updated settings
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Exception in update-site-settings:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
