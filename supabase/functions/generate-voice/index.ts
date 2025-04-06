
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      return new Response(
        JSON.stringify({
          error: "API key not configured. Please set ELEVENLABS_API_KEY.",
          details: "Contact administrator to configure the API key"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }

    // Parse request data
    const requestData = await req.json();
    
    // Extract text and voiceId, with validation
    const { text, voiceId } = requestData;

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required", details: "The text parameter cannot be empty" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    // Using a reasonable default voice ID if not provided
    const finalVoiceId = voiceId || "21m00Tcm4TlvDq8ikWAM"; // Default to 'Rachel' voice

    // Safe text processing - convert to string and limit length
    let processedText = "";
    if (typeof text === 'string') {
      processedText = text.substring(0, 4000); // Reduced from 5000 to 4000 to avoid potential API limits
    } else {
      processedText = String(text).substring(0, 4000);
    }
    
    // Log request details for debugging
    console.log(`Generating voice with ElevenLabs: length=${processedText.length}, voiceId=${finalVoiceId}`);
    
    try {
      // Call ElevenLabs API with improved error handling
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsApiKey,
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text: processedText,
          model_id: "eleven_turbo_v2", // Using faster model which is more reliable
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      // Handle API response errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error (${response.status}): ${errorText}`);
        return new Response(
          JSON.stringify({ 
            error: `ElevenLabs API error: ${response.status} ${response.statusText}`,
            details: errorText
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: response.status
          }
        );
      }

      console.log("ElevenLabs response received successfully");
      
      // Process the audio response
      const audioArrayBuffer = await response.arrayBuffer();
      
      // Check if the response is empty or invalid
      if (!audioArrayBuffer || audioArrayBuffer.byteLength === 0) {
        throw new Error("Received empty audio data from ElevenLabs");
      }
      
      // Safely convert to base64
      const base64Audio = btoa(
        new Uint8Array(audioArrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

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
    } catch (apiError) {
      console.error("ElevenLabs API call failed:", apiError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate audio with ElevenLabs", 
          details: apiError instanceof Error ? apiError.message : String(apiError)
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
  } catch (error) {
    console.error("Voice generation error:", error);
    
    // Return a structured error response
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate voice content",
        details: String(error)
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
