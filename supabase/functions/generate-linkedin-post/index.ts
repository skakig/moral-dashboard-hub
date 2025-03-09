
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
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
      throw new Error("OpenAI API key not configured");
    }

    const { theme, keywords, contentType, moralLevel, contentLength, tone } = await req.json();

    if (!theme) {
      return new Response(
        JSON.stringify({ error: "Theme is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Generating LinkedIn content: ${contentType}, Moral Level: ${moralLevel}, Length: ${contentLength}, Tone: ${tone || 'informative'}`);

    // Determine the content instruction based on content type
    let contentInstruction = "";
    if (contentType === "article") {
      contentInstruction = "a professional LinkedIn article";
    } else if (contentType === "social_media") {
      contentInstruction = "a professional LinkedIn post";
    } else {
      contentInstruction = "professional LinkedIn content";
    }

    // Prepare the prompt for OpenAI
    const systemPrompt = `You are an expert LinkedIn content creator with deep knowledge of The Moral Hierarchy (TMH) framework.
Your task is to create ${contentInstruction} about the following theme: "${theme}".
The content should align with moral level ${moralLevel} of TMH, which corresponds to ${getMoralLevelDescription(moralLevel)}.
The content length should be ${contentLength} and the tone should be ${tone || 'informative'}.
${keywords && keywords.length > 0 ? `Try to incorporate these keywords: ${keywords.join(', ')}.` : ''}
Format the content appropriately for LinkedIn, including appropriate line breaks, emojis if appropriate, and a compelling title.`;

    const userPrompt = `Please create ${contentInstruction} about: ${theme}`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
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
      throw new Error("No content generated");
    }

    const generatedContent = data.choices[0].message.content;

    // Extract title and content
    let title = "";
    let content = generatedContent;
    
    // Try to extract title from the first line
    const lines = generatedContent.split('\n');
    if (lines.length > 0 && (lines[0].startsWith('#') || lines[0].startsWith('Title:') || lines[0].length < 100)) {
      title = lines[0].replace(/^#\s*|Title:\s*/i, '');
      content = lines.slice(1).join('\n').trim();
    }

    // Generate a meta description (shorter version of the content)
    const metaDescription = content.substring(0, 150) + (content.length > 150 ? '...' : '');

    // Return the generated content
    return new Response(
      JSON.stringify({
        title,
        content,
        metaDescription,
        keywords: keywords || []
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating LinkedIn content:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate content" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper function to get moral level description
function getMoralLevelDescription(level: number): string {
  const levels = {
    1: "Survival Morality (focused on self-preservation and basic needs)",
    2: "Self-Interest (pragmatic morality focused on personal gain)",
    3: "Social Contract (cooperative morality based on mutual agreements)",
    4: "Fairness (justice-oriented morality centered on rights and balance)",
    5: "Empathy (relational morality driven by understanding others)",
    6: "Altruism (sacrificial morality prioritizing others' needs)",
    7: "Integrity (principled morality upholding personal values)",
    8: "Virtue (aspiring morality embodying excellence)",
    9: "Self-Actualization (transcendent morality aligned with higher purpose)"
  };
  
  return levels[level as keyof typeof levels] || "balanced moral understanding";
}
