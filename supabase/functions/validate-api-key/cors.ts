
// Update the CORS headers to be more permissive for development
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // In production, you might want to restrict this
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
