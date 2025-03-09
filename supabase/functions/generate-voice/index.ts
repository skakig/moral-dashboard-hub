
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
    const { text, title, voiceId } = await req.json();
    
    if (!text) {
      throw new Error("Text content is required");
    }
    
    // Get API key from environment
    const elevenlabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!elevenlabsApiKey) {
      throw new Error("ElevenLabs API key is not configured");
    }
    
    // Use the provided voice ID or default to Rachel
    const selectedVoiceId = voiceId || "21m00Tcm4TlvDq8ikWAM"; // Default is Rachel
    
    console.log(`Generating voice for text (${text.length} chars) using voice ID: ${selectedVoiceId}`);
    
    // For longer text, we might need to truncate or split it
    const processedText = text.length > 5000 ? text.substring(0, 4997) + "..." : text;
    
    // Call the ElevenLabs Text-to-Speech API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenlabsApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: processedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      }),
    });
    
    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = errorData.detail || response.statusText;
      } catch (e) {
        errorText = response.statusText;
      }
      
      console.error("ElevenLabs API error:", errorText);
      throw new Error(`Failed to generate voice: ${errorText}`);
    }
    
    // Convert the audio response to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = bytesToBase64(new Uint8Array(arrayBuffer));
    
    // Generate a filename based on the title
    const safeTitleForFilename = (title || "voice-content")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    
    const fileName = `${safeTitleForFilename}-${Date.now()}.mp3`;
    
    return new Response(
      JSON.stringify({
        success: true,
        audioBase64: base64Audio,
        fileName: fileName,
        mimeType: "audio/mpeg",
        durationSeconds: estimateAudioDuration(text.length), // Rough estimate
        createdAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in voice generation:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate voice content" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper function to convert bytes to base64
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper function to estimate audio duration based on text length
// This is a very rough estimation (about 3 words per second)
function estimateAudioDuration(textLength: number): number {
  const averageWordsPerMinute = 150; // Average speaking rate
  const averageCharactersPerWord = 5; // Average English word length
  
  const estimatedWords = textLength / averageCharactersPerWord;
  const estimatedMinutes = estimatedWords / averageWordsPerMinute;
  
  return Math.max(1, Math.round(estimatedMinutes * 60)); // Return seconds, minimum 1 second
}
