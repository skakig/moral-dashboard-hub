
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Configure CORS headers
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
    const { text, voice = 'alloy' } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Truncate text if too long (OpenAI has limits)
    const truncatedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;
    
    // Get OpenAI API key from environment variable
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Generating voice with OpenAI TTS API, voice: ${voice}, text length: ${truncatedText.length}`);

    // Call OpenAI Text-to-Speech API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice,
        input: truncatedText,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API returned ${response.status}: ${errorData}`);
    }

    // Get the audio data as ArrayBuffer
    const audioData = await response.arrayBuffer();
    
    // Convert to base64 for easy transfer
    const base64Audio = btoa(
      new Uint8Array(audioData).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    // Create data URL that can be used directly in audio elements
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
    const fileName = `voice-${Date.now()}.mp3`;

    return new Response(
      JSON.stringify({ 
        audioUrl, 
        fileName,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating voice with OpenAI:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate voice with OpenAI',
        success: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
