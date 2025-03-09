
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
    
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY or OPEN_AI_TMH environment variable.");
    }

    const requestData = await req.json().catch(e => {
      console.error("Failed to parse request JSON:", e);
      throw new Error("Invalid request format: " + e.message);
    });
    
    const { text, voice = "alloy" } = requestData;

    if (!text) {
      throw new Error("Text content is required");
    }

    console.log(`Generating voice using OpenAI TTS: voice=${voice}, text length=${text.length}`);
    console.log(`Text sample: ${text.substring(0, 100)}...`);

    // OpenAI supports these voices: alloy, echo, fable, onyx, nova, shimmer
    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    const selectedVoice = validVoices.includes(voice) ? voice : "alloy";

    // Generate speech using OpenAI TTS
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: selectedVoice,
        input: text.substring(0, 4000), // OpenAI has a character limit
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      let errorMessage = "OpenAI API error: HTTP " + response.status;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the raw response text
        try {
          errorMessage = await response.text();
        } catch {
          // If even that fails, just use the status code
          errorMessage = `OpenAI API error: HTTP ${response.status}`;
        }
      }
      
      console.error("OpenAI TTS API error:", errorMessage);
      throw new Error(errorMessage);
    }

    // Get the audio as ArrayBuffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const bytes = new Uint8Array(audioBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Audio = btoa(binary);
    
    // Generate a filename
    const fileName = `voice_${Date.now()}.mp3`;
    
    // Create data URL
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
    
    console.log("OpenAI TTS generation successful, audio length:", base64Audio.length);
    
    return new Response(
      JSON.stringify({
        audioUrl,
        fileName,
        base64Audio,
        service: "openai",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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
