
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
    console.log("Received request to generate-seo-data function");
    
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("OPEN_AI_TMH");
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const { theme, platform, contentType } = await req.json();
    
    if (!theme) {
      return new Response(
        JSON.stringify({ error: "Theme is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create a prompt to generate SEO keywords
    const prompt = `Generate 10 SEO-friendly hashtags and keywords for ${contentType || 'content'} about "${theme}" for ${platform || 'social media'}. 
    Format the response as an array of keywords without any explanations or additional text.
    Make sure the keywords are relevant, trending, and optimized for discovery.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an SEO expert who generates effective keywords and hashtags." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No keywords generated");
    }

    // Extract and process keywords from OpenAI response
    let keywordsText = data.choices[0].message.content;
    
    // Clean up the response to extract just the keywords/hashtags
    let keywords: string[] = [];
    
    // Check if response contains an array format (with brackets)
    if (keywordsText.includes('[') && keywordsText.includes(']')) {
      try {
        // Try to extract anything that looks like an array
        const arrayMatch = keywordsText.match(/\[([^\]]+)\]/);
        if (arrayMatch && arrayMatch[1]) {
          // Parse the array string, handling different formats
          keywords = arrayMatch[1]
            .split(/,\s*/)
            .map(k => k.trim().replace(/^["']+|["']+$/g, ''))
            .filter(k => k);
        }
      } catch (e) {
        console.error("Error parsing keywords array:", e);
      }
    }
    
    // If array parsing failed, fall back to line-by-line or comma separation
    if (keywords.length === 0) {
      keywords = keywordsText
        .split(/[\n,]/)
        .map(k => k.trim())
        .filter(k => k && !k.startsWith('*') && !k.startsWith('-'))
        .map(k => {
          // Clean up formatting and ensure hashtags start with #
          let cleaned = k.replace(/^\d+\.\s*/, '').trim();
          if (cleaned.includes('#')) {
            // Already has a hashtag
            return cleaned;
          } else if (cleaned.match(/^[A-Za-z0-9]+$/)) {
            // Single word without spaces, add hashtag
            return '#' + cleaned;
          } else {
            // Multi-word or complex term
            return cleaned;
          }
        });
    }
    
    // Ensure we don't have more than 10 keywords
    keywords = keywords.slice(0, 10);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        keywords
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating SEO data:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate SEO data",
        keywords: [] 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
