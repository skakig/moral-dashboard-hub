
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
    // Get API key from environment variable
    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");

    // Check if API key is available
    if (!elevenLabsApiKey) {
      console.error("Missing API key: ELEVENLABS_API_KEY is not configured");
      throw new Error("API key not configured. Please set ELEVENLABS_API_KEY.");
    }

    // Parse request data
    const requestData = await req.json().catch(e => {
      console.error("Error parsing JSON:", e);
      throw new Error("Invalid request format");
    });
    
    let { text, voiceId } = requestData;

    if (!text) {
      throw new Error("Text is required");
    }

    // Ensure text is a string and handle potential JSON objects
    if (typeof text === 'object') {
      try {
        // If text is an object, try to extract content property or stringify it
        if (text.content) {
          text = text.content;
        } else {
          text = JSON.stringify(text);
        }
      } catch (e) {
        console.error("Error processing text object:", e);
        text = "Error processing content.";
      }
    }

    // Simple text processing - extract plain text content
    // Remove markdown and code formatting
    text = text.replace(/```[\s\S]*?```/g, ''); // Remove code blocks
    text = text.replace(/\[.*?\]/g, ''); // Remove markdown links
    text = text.replace(/\*\*/g, ''); // Remove bold formatting
    text = text.replace(/\\n/g, ' '); // Replace escaped newlines

    // Trim the text if it's too long - prevents API timeouts
    const maxLength = 4000;
    const trimmedText = text.length > maxLength 
      ? text.substring(0, maxLength) + "..." 
      : text;
    
    console.log(`Generating voice for text (length: ${trimmedText.length}) with voice ID: ${voiceId || "default"}`);
    
    // Use ElevenLabs API
    const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId || "21m00Tcm4TlvDq8ikWAM"}`, {
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
    });

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error(`ElevenLabs API error (${elevenLabsResponse.status}): ${errorText}`);
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

  } catch (error) {
    console.error("Voice generation error:", error);
    
    // Return a structured error response
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
