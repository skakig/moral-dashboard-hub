
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("OPEN_AI_TMH");
    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");

    if (!openAIApiKey && !elevenLabsApiKey) {
      throw new Error("API keys not configured. Please set either OPENAI_API_KEY or ELEVENLABS_API_KEY.");
    }

    const { text, voiceId } = await req.json();

    if (!text) {
      throw new Error("Text is required");
    }

    console.log(`Generating voice for text (length: ${text.length}) with voice ID: ${voiceId || "default"}`);

    // Try ElevenLabs first if API key is available
    if (elevenLabsApiKey) {
      try {
        // Use ElevenLabs API
        const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + (voiceId || "21m00Tcm4TlvDq8ikWAM"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsApiKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("ElevenLabs API error:", errorData);
          throw new Error(`ElevenLabs API error: ${response.statusText}`);
        }

        const audioArrayBuffer = await response.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

        const fileName = `voice_${Date.now()}.mp3`;

        return new Response(
          JSON.stringify({
            audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
            fileName: fileName,
            base64Audio: base64Audio,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (elevenLabsError) {
        console.error("ElevenLabs processing error:", elevenLabsError);
        // Fall back to OpenAI if ElevenLabs fails
        if (!openAIApiKey) throw elevenLabsError;
      }
    }

    // Fall back to OpenAI TTS if ElevenLabs fails or isn't configured
    if (openAIApiKey) {
      // Use OpenAI API instead
      const openAiVoice = getOpenAIVoiceFromElevenLabsId(voiceId);
      
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAIApiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: openAiVoice,
          response_format: "mp3",
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const audioArrayBuffer = await response.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

      const fileName = `voice_${Date.now()}.mp3`;

      return new Response(
        JSON.stringify({
          audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
          fileName: fileName,
          base64Audio: base64Audio,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("No available text-to-speech service");

  } catch (error) {
    console.error("Voice generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate voice content",
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});

// Helper function to map ElevenLabs voice IDs to OpenAI voices
function getOpenAIVoiceFromElevenLabsId(elevenlabsId: string): string {
  const voiceMap: Record<string, string> = {
    '21m00Tcm4TlvDq8ikWAM': 'nova', // Rachel
    'AZnzlk1XvdvUeBnXmlld': 'shimmer', // Domi
    'EXAVITQu4vr4xnSDxMaL': 'nova', // Sarah
    'MF3mGyEYCl7XYWbV9V6O': 'echo', // Adam
    'TxGEqnHWrfWFTfGW9XjX': 'onyx', // Josh
    'VR6AewLTigWG4xSOukaG': 'alloy', // Nicole
    'pNInz6obpgDQGcFmaJgB': 'fable', // Sam
  };
  
  return voiceMap[elevenlabsId] || 'alloy'; // Default to alloy if no mapping exists
}
