
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Default sharing options if none are found in DB
const defaultSharingOptions = {
  redirectUrl: 'https://themh.io',
  additionalTags: ['TheMoralHierarchy', 'TMH'],
  message: ''
};

// Interface for sharing options
interface SharingOptions {
  redirectUrl?: string;
  additionalTags?: string[];
  message?: string;
}

// The Deno serve handler
serve(async (req) => {
  try {
    // Parse request
    const { platform } = await req.json();
    
    if (!platform) {
      return new Response(
        JSON.stringify({ error: 'Platform is required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Try to fetch sharing options from database
    const { data, error } = await supabase
      .from('sharing_options')
      .select('*')
      .eq('platform', platform.toLowerCase())
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      // If error is not "No results found", it's a real error
      console.error('Error fetching sharing options:', error);
      throw error;
    }
    
    // Default sharing options if none found
    const sharingOptions: SharingOptions = data ? {
      redirectUrl: data.redirect_url || defaultSharingOptions.redirectUrl,
      additionalTags: data.additional_tags || defaultSharingOptions.additionalTags,
      message: data.message || defaultSharingOptions.message
    } : defaultSharingOptions;
    
    // Add platform-specific defaults
    if (platform.toLowerCase() === 'twitter' || platform.toLowerCase() === 'x') {
      sharingOptions.message = sharingOptions.message || 'Check out this meme! ';
    }
    
    return new Response(
      JSON.stringify(sharingOptions),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
