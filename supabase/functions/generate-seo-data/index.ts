
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get the API key from environment variables - check multiple possible env var names
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || 
                    Deno.env.get('OPEN_AI_TMH') || 
                    Deno.env.get('OPEN-AI-CUSTOM-GPT');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to generate-seo-data function");
    
    if (!openAIApiKey) {
      console.error("OpenAI API key is missing");
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error', 
          details: 'OpenAI API key is not configured' 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { theme, platform = "general", contentType = "article" } = await req.json();
    
    if (!theme) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters', details: 'Theme is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Generating SEO keywords for:", { theme, platform, contentType });

    // Generate keywords with OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `Generate 5-10 platform-specific keywords or hashtags for ${platform} content about ${theme}. Return only the keywords as a comma-separated list without any other text.` 
          },
          { role: 'user', content: `Create keywords for a ${contentType} about ${theme} for ${platform}` }
        ],
        temperature: 0.5,
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error('Invalid OpenAI response:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to generate keywords', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const keywordsText = data.choices[0].message.content;
    // Parse the comma-separated list
    const keywords = keywordsText.split(',').map((k: string) => k.trim());

    console.log("Generated keywords:", keywords);

    return new Response(
      JSON.stringify({ keywords }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating SEO data:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
