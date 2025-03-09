
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
      throw new Error("API key not configured. Please set OPENAI_API_KEY or OPEN_AI_TMH.");
    }

    const requestData = await req.json().catch(error => {
      console.error("Error parsing request JSON:", error);
      throw new Error("Invalid request format. Please provide valid JSON.");
    });
    
    const { prompt, width = 1024, height = 1024, platform } = requestData;

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log(`Generating image for platform: ${platform}, dimensions: ${width}x${height}, prompt: ${prompt.substring(0, 100)}...`);

    // Generate a text description for DALL-E
    const enhancedPromptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that converts simple image requests into detailed, creative DALL-E prompts. 
                     Generate a detailed, vivid description optimized for the ${platform || "general"} platform.
                     If applicable, make sure the image description is appropriate for the platform's audience and style.`
          },
          {
            role: "user",
            content: `Create a detailed DALL-E prompt based on this request: "${prompt}". 
                     This will be used on ${platform || "social media"} with dimensions ${width}x${height}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!enhancedPromptResponse.ok) {
      console.error("OpenAI chat API error:", await enhancedPromptResponse.text());
      throw new Error("Failed to generate enhanced image description");
    }

    const enhancedPromptData = await enhancedPromptResponse.json();
    const enhancedPrompt = enhancedPromptData.choices[0].message.content.trim();
    
    console.log("Enhanced image prompt:", enhancedPrompt.substring(0, 100) + "...");

    // Check if DALL-E 3 supports the requested dimensions
    // DALL-E 3 only supports certain aspect ratios
    let size = "1024x1024"; // Default square
    const aspectRatio = width / height;
    
    if (aspectRatio > 1.3 && aspectRatio < 1.9) {
      // Landscape - closest to 16:9
      size = "1792x1024";
    } else if (aspectRatio < 0.8 && aspectRatio > 0.55) {
      // Portrait - closest to 9:16
      size = "1024x1792";
    } else if (aspectRatio <= 1.3 && aspectRatio >= 0.8) {
      // Square-ish
      size = "1024x1024";
    } else {
      console.log(`Requested aspect ratio ${aspectRatio.toFixed(2)} is not directly supported by DALL-E 3, using closest match: ${size}`);
    }

    // Use the enhanced prompt for image generation
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        response_format: "b64_json",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "OpenAI API error";
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the raw text
        errorMessage = `${errorMessage}: ${errorText}`;
      }
      
      console.error("OpenAI API error:", errorMessage);
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      console.error("Invalid response structure from OpenAI:", JSON.stringify(data).substring(0, 200));
      throw new Error("Invalid response format from OpenAI API");
    }

    const base64Image = data.data[0].b64_json;
    
    return new Response(
      JSON.stringify({
        image: `data:image/png;base64,${base64Image}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate image",
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
