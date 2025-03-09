
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

    const { theme, keywords, contentType, moralLevel, platform, contentLength, tone } = await req.json();

    if (!theme) {
      return new Response(
        JSON.stringify({ error: "Theme is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!platform) {
      return new Response(
        JSON.stringify({ error: "Platform is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Generating content for ${platform}: ${contentType}, Moral Level: ${moralLevel}, Length: ${contentLength}, Tone: ${tone || 'informative'}`);

    // Check if we need to use the LinkedIn-specific endpoint
    if (platform === "LinkedIn") {
      console.log("Redirecting to LinkedIn-specific function");
      
      try {
        // Call the LinkedIn-specific function
        const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-linkedin-post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            theme, 
            keywords, 
            contentType, 
            moralLevel, 
            contentLength, 
            tone
          }),
        });
        
        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || response.statusText;
          } catch (e) {
            errorMessage = response.statusText;
          }
          throw new Error(`LinkedIn content generation failed: ${errorMessage}`);
        }
        
        const linkedInContent = await response.json();
        return new Response(
          JSON.stringify(linkedInContent),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("LinkedIn function error:", error);
        // If LinkedIn function fails, fallback to regular generation
        console.log("Falling back to regular content generation");
      }
    }

    // Determine the content type instruction
    let contentInstruction = "";
    if (contentType === "article") {
      contentInstruction = "a comprehensive article";
    } else if (contentType === "blog_post") {
      contentInstruction = "an engaging blog post";
    } else if (contentType === "social_media") {
      contentInstruction = `a social media post for ${platform}`;
    } else if (contentType === "youtube_script") {
      contentInstruction = "a YouTube video script with intro, main sections, and outro";
    } else if (contentType === "youtube_shorts") {
      contentInstruction = "a short YouTube script (30-60 seconds)";
    } else if (contentType === "youtube_description") {
      contentInstruction = "a YouTube video description with tags";
    } else if (contentType === "tweet_thread") {
      contentInstruction = "a Twitter thread (5-7 tweets)";
    } else if (contentType === "carousel") {
      contentInstruction = "an Instagram carousel post with 5-7 slides";
    } else if (contentType === "reels_script") {
      contentInstruction = "an Instagram Reels script";
    } else if (contentType === "script") {
      contentInstruction = `a script for ${platform}`;
    } else {
      contentInstruction = `content for ${platform}`;
    }

    // Prepare the prompt for OpenAI
    const systemPrompt = `You are an expert content creator with deep knowledge of The Moral Hierarchy (TMH) framework.
Your task is to create ${contentInstruction} about the following theme: "${theme}".
The content should align with moral level ${moralLevel} of TMH, which corresponds to ${getMoralLevelDescription(moralLevel)}.
The content length should be ${contentLength} and the tone should be ${tone || 'informative'}.
${keywords && keywords.length > 0 ? `Try to incorporate these keywords: ${keywords.join(', ')}.` : ''}
Format the content appropriately for ${platform}, including appropriate formatting, structure, and style for that platform.
Include a compelling title and, if appropriate for the platform, a meta description or summary.`;

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
    console.error("Error generating content:", error);
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
