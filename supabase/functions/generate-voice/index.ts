
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

    const requestData = await req.json().catch(e => {
      console.error("Error parsing JSON:", e);
      throw new Error("Invalid request format");
    });
    
    const { text, voiceId } = requestData;

    if (!text) {
      throw new Error("Text is required");
    }

    // Trim the text if it's too long - prevents API timeouts
    const trimmedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;
    
    console.log(`Generating voice for text (length: ${trimmedText.length}) with voice ID: ${voiceId || "default"}`);

    // Try ElevenLabs first if API key is available
    if (elevenLabsApiKey) {
      try {
        console.log("Attempting to use ElevenLabs API...");
        
        // Use ElevenLabs API
        const elevenLabsResponse = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + (voiceId || "21m00Tcm4TlvDq8ikWAM"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsApiKey,
          },
          body: JSON.stringify({
            text: trimmedText,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }).catch(e => {
          console.error("ElevenLabs network error:", e);
          throw new Error("Network error contacting ElevenLabs");
        });

        if (!elevenLabsResponse.ok) {
          const errorData = await elevenLabsResponse.text();
          console.error("ElevenLabs API error:", errorData);
          throw new Error(`ElevenLabs API error: ${elevenLabsResponse.status} ${elevenLabsResponse.statusText}`);
        }

        console.log("ElevenLabs response received successfully");
        
        const audioArrayBuffer = await elevenLabsResponse.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

        const fileName = `voice_${Date.now()}.mp3`;

        return new Response(
          JSON.stringify({
            audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
            fileName: fileName,
            base64Audio: base64Audio,
            service: "elevenlabs"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (elevenLabsError) {
        console.error("ElevenLabs processing error:", elevenLabsError);
        console.log("Falling back to OpenAI TTS...");
        // Fall back to OpenAI if ElevenLabs fails
        if (!openAIApiKey) throw elevenLabsError;
      }
    }

    // Fall back to OpenAI TTS if ElevenLabs fails or isn't configured
    if (openAIApiKey) {
      console.log("Using OpenAI TTS...");
      
      const openAIResponse = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAIApiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: trimmedText,
          voice: "alloy", // OpenAI voice options: alloy, echo, fable, onyx, nova, shimmer
          response_format: "mp3",
        }),
      }).catch(e => {
        console.error("OpenAI network error:", e);
        throw new Error("Network error contacting OpenAI");
      });

      if (!openAIResponse.ok) {
        const errorData = await openAIResponse.json().catch(e => ({}));
        console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API error: ${openAIResponse.status} ${openAIResponse.statusText}`);
      }

      console.log("OpenAI response received successfully");
      
      const audioArrayBuffer = await openAIResponse.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

      const fileName = `voice_${Date.now()}.mp3`;

      return new Response(
        JSON.stringify({
          audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
          fileName: fileName,
          base64Audio: base64Audio,
          service: "openai"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("No valid voice service available");

  } catch (error) {
    console.error("Voice generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate voice",
        details: error.toString() 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
