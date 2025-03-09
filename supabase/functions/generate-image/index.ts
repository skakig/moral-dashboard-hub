
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
    
    const { prompt } = requestData;

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log(`Generating image for prompt: ${prompt.substring(0, 100)}...`);

    // Use OpenAI DALL-E 3 API for image generation
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      }),
    }).catch(error => {
      console.error("Network error during OpenAI API call:", error);
      throw new Error("Network error while contacting OpenAI API. Please try again.");
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

    const data = await response.json().catch(error => {
      console.error("Error parsing OpenAI API response:", error);
      throw new Error("Failed to parse response from OpenAI API.");
    });
    
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
