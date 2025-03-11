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
    const requestData = await req.json();
    
    // Extract text and voiceId, with validation
    const { text, voiceId } = requestData;

    if (!text) {
      throw new Error("Text is required");
    }

    // Process text - keep it simple to avoid recursion
    let processedText = text;
    
    // If text is an object, handle it appropriately
    if (typeof processedText === 'object') {
      try {
        if (processedText.content) {
          processedText = processedText.content;
        } else {
          processedText = JSON.stringify(processedText);
        }
      } catch (e) {
        console.error("Error processing text object:", e);
        processedText = "Error processing content.";
      }
    }

    // Convert to string if somehow it's not a string
    processedText = String(processedText);

    // Simple sanitization - remove markdown
    processedText = processedText.replace(/```[\s\S]*?```/g, ''); // Remove code blocks
    processedText = processedText.replace(/\*\*/g, ''); // Remove bold formatting
    
    // Limit text length to prevent timeouts
    const maxLength = 4000;
    if (processedText.length > maxLength) {
      console.log(`Text length (${processedText.length}) exceeds maximum. Trimming...`);
      processedText = processedText.substring(0, maxLength) + "...";
    }
    
    console.log(`Generating voice for text (length: ${processedText.length}) with voice ID: ${voiceId || "21m00Tcm4TlvDq8ikWAM"}`);
    
    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId || "21m00Tcm4TlvDq8ikWAM"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: processedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error (${response.status}): ${errorText}`);
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    console.log("ElevenLabs response received successfully");
    
    // Process the audio response
    const audioArrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

    const fileName = `voice_${Date.now()}.mp3`;

    // Return the processed audio
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
