
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
      throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
    }

    const requestData = await req.json();
    
    const { content, theme, platform = "general", contentType = "article" } = requestData;

    if (!content && !theme) {
      throw new Error("Either content or theme is required");
    }

    // For shorter content, avoid truncating by using the theme
    const inputText = theme && content?.length > 1000 ? theme : content;
    
    console.log(`Generating SEO data for: ${platform} ${contentType} with theme: "${theme?.substring(0, 50)}..."`);

    const prompt = `Generate SEO metadata for a ${platform} ${contentType} about:
"${inputText}"

Return ONLY a JSON object with this structure:
{
  "metaDescription": "A compelling meta description under 155 characters that accurately summarizes the content and encourages clicks",
  "keywords": ["keyword1", "keyword2", "keyword3", ...] // 5-10 relevant keywords/tags for this specific platform, with no #
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: `You are an expert SEO specialist for The Moral Hierarchy (TMH) framework. 
Generate platform-specific SEO content that maximizes visibility for moral and ethical content.
Focus on clear, compelling descriptions and precise keywords.` 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    const responseData = await response.json();
    const generatedText = responseData.choices[0].message.content;
    
    // Parse the JSON response from OpenAI
    let seoData;
    try {
      // Extract JSON if it's wrapped in any code blocks
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        generatedText.match(/```\s*([\s\S]*?)\s*```/) || 
                        generatedText.match(/{[\s\S]*}/);
                        
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : generatedText;
      seoData = JSON.parse(jsonString);
      
      // Ensure we have the expected structure
      if (!seoData.metaDescription || !Array.isArray(seoData.keywords)) {
        throw new Error("Unexpected response format from OpenAI");
      }
      
      // Process keywords to platform-specific format
      if (platform === "Twitter" || platform === "Instagram" || platform === "TikTok") {
        // Add hashtags for social media platforms
        seoData.keywords = seoData.keywords.map((keyword: string) => 
          keyword.startsWith("#") ? keyword : `#${keyword.replace(/\s+/g, "")}`
        );
      }
    } catch (error) {
      console.error("Error parsing SEO data:", error);
      
      // Create a fallback structure
      seoData = {
        metaDescription: theme || "Explore The Moral Hierarchy framework and enhance your ethical understanding with this insightful content.",
        keywords: ["The Moral Hierarchy", "TMH", "ethics", "morality", "personal growth", platform, contentType]
      };
    }
    
    console.log("Successfully generated SEO data");
    
    return new Response(
      JSON.stringify(seoData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SEO generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate SEO data",
        metaDescription: "",
        keywords: [] 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
