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

    // Map content length to specific word counts for better control
    let wordCountTarget;
    switch (contentLength) {
      case "short":
        wordCountTarget = "300-500";
        break;
      case "medium":
        wordCountTarget = "800-1200";
        break;
      case "long":
        wordCountTarget = "1500-2000";
        break;
      default:
        wordCountTarget = "800-1200"; // Default to medium
    }

    // Content type specific instructions
    let contentInstruction = "";
    let formatInstructions = "";

    if (contentType === "article") {
      contentInstruction = `a comprehensive article (${wordCountTarget} words)`;
      formatInstructions = "Use proper article formatting with headings, subheadings, and paragraphs.";
    } else if (contentType === "blog_post") {
      contentInstruction = `an engaging blog post (${wordCountTarget} words)`;
      formatInstructions = "Format with a catchy introduction, clear sections, and a conclusion with a call-to-action.";
    } else if (contentType === "social_media") {
      contentInstruction = `a social media post for ${platform}`;
      
      // Platform-specific formatting
      if (platform === "Instagram") {
        formatInstructions = "Keep it visually descriptive, include relevant hashtags, and write in a way that encourages engagement.";
      } else if (platform === "Twitter") {
        formatInstructions = "Keep it concise (under 280 characters), impactful, and include relevant hashtags.";
      } else if (platform === "Facebook") {
        formatInstructions = "Write in a conversational tone, aim for 1-2 paragraphs, and include a question or call-to-action to encourage engagement.";
      } else if (platform === "TikTok") {
        formatInstructions = "Create trendy, attention-grabbing content that hooks viewers in the first 3 seconds. Include suggested visuals.";
      }
    } else if (contentType === "youtube_script") {
      contentInstruction = `a YouTube video script with intro, main sections, and outro (${wordCountTarget} words)`;
      formatInstructions = "Format as a script with [INTRO], [SECTION 1], etc. Include both spoken lines and brief staging/visual directions in [brackets].";
    } else if (contentType === "youtube_shorts") {
      contentInstruction = "a short YouTube script (30-60 seconds)";
      formatInstructions = "Make it quick, engaging, and straight to the point. Include both script and visual directions.";
    } else if (contentType === "youtube_description") {
      contentInstruction = "a YouTube video description with tags";
      formatInstructions = "Include a compelling first 2-3 sentences, timestamps if relevant, links, and a set of 10-15 SEO-friendly tags at the end.";
    } else if (contentType === "tweet_thread") {
      contentInstruction = "a Twitter thread (5-7 tweets)";
      formatInstructions = "Format as Tweet 1/7, Tweet 2/7, etc. Keep each tweet under 280 characters and make sure they flow logically.";
    } else if (contentType === "carousel") {
      contentInstruction = "an Instagram carousel post with 5-7 slides";
      formatInstructions = "Format as [Slide 1], [Slide 2], etc. Each slide should be concise with a clear visual description.";
    } else if (contentType === "reels_script") {
      contentInstruction = "an Instagram Reels script";
      formatInstructions = "Write a 15-30 second script with both spoken lines and visual directions. Focus on high engagement in the first 3 seconds.";
    } else if (contentType === "script") {
      contentInstruction = `a script for ${platform} (${wordCountTarget} words)`;
      formatInstructions = "Format with clear sections, spoken lines, and brief directions for visuals or actions.";
    } else {
      contentInstruction = `content for ${platform} (${wordCountTarget} words)`;
      formatInstructions = "Format appropriately for the platform and ensure it's engaging for the target audience.";
    }

    // Get detailed moral level information
    const moralLevelDetails = getMoralLevelDescription(moralLevel);

    // Prepare the prompt for OpenAI
    const systemPrompt = `You are an expert content creator with deep knowledge of The Moral Hierarchy (TMH) framework.
Your task is to create ${contentInstruction} about the following theme: "${theme}".

Content Requirements:
- The content should align with moral level ${moralLevel} of TMH, which corresponds to ${moralLevelDetails}.
- Length should be appropriate for ${contentLength} content (${wordCountTarget} words where applicable).
- The tone should be ${tone || 'informative'}.
${keywords && keywords.length > 0 ? `- Incorporate these keywords where natural: ${keywords.join(', ')}.` : ''}
- Content must be well-structured and tailored specifically for ${platform}.

Format and Technical Requirements:
${formatInstructions}
- Include a compelling title.
- Include a meta description or summary, appropriate for SEO.

IMPORTANT: Ensure the content genuinely represents moral level ${moralLevel} thinking and values. The content should exemplify this level of moral reasoning both in its examples and overall approach.`;

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
        max_tokens: 1500,
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
    if (lines.length > 0) {
      // Check for various title formats
      const firstLine = lines[0].trim();
      if (firstLine.startsWith('#') || 
          firstLine.startsWith('Title:') || 
          firstLine.length < 100 ||
          firstLine.endsWith(':') ||
          /^".*"$/.test(firstLine) // Quoted title
      ) {
        title = firstLine.replace(/^#\s*|Title:\s*|"|:$/g, '');
        content = lines.slice(1).join('\n').trim();
      }
    }

    // Generate a meta description (shorter version of the content)
    let metaDescription = "";
    // Try to extract from content if there's a line starting with "Meta Description:" or similar
    const metaMatch = content.match(/meta\s*description:?\s*(.*?)(?:\n\n|\n$|$)/i);
    if (metaMatch && metaMatch[1]) {
      metaDescription = metaMatch[1].trim();
      // Remove the meta description line from content
      content = content.replace(/meta\s*description:?\s*(.*?)(?:\n\n|\n$|$)/i, '');
    } else {
      // Generate from content
      const plainText = content.replace(/\[.*?\]|\*\*|#/g, '').trim(); // Remove markdown formatting
      metaDescription = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    }

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

// Helper function to get detailed moral level description
function getMoralLevelDescription(level: number): string {
  const levels = {
    1: "Survival Morality (focused on self-preservation and basic needs). This level is characterized by decisions based on immediate survival, safety, and security needs. Content should reflect protective instincts, crisis management, or basic need fulfillment.",
    
    2: "Self-Interest (pragmatic morality focused on personal gain). This level is characterized by strategic thinking for personal advantage, comfort, and achievement. Content should reflect ambition, practical decision-making, and rational self-advantage.",
    
    3: "Social Contract (cooperative morality based on mutual agreements). This level centers on belonging, cooperation, and maintaining social harmony. Content should reflect teamwork, community standards, and the value of clear agreements and expectations.",
    
    4: "Fairness (justice-oriented morality centered on rights and balance). This level emphasizes equality, justice, and following principles. Content should reflect fairness, impartiality, and systematic approaches to ethical decisions.",
    
    5: "Empathy (relational morality driven by understanding others). This level focuses on emotional connection, understanding different perspectives, and compassion. Content should reflect genuine care for others' well-being and emotional depth.",
    
    6: "Altruism (sacrificial morality prioritizing others' needs). This level is characterized by selfless giving, often at personal cost. Content should reflect genuine sacrifice, service without expectation of return, and putting others' needs first.",
    
    7: "Integrity (principled morality upholding personal values). This level involves unwavering commitment to moral principles regardless of consequences. Content should reflect moral courage, consistent values across all situations, and truth-telling even when costly.",
    
    8: "Virtue (aspiring morality embodying excellence). This level involves cultivating character qualities like wisdom, courage, and temperance. Content should reflect the pursuit of moral excellence as a way of life, not just a series of decisions.",
    
    9: "Self-Actualization (transcendent morality aligned with higher purpose). The highest level focuses on alignment with universal principles and spiritual truth. Content should reflect wisdom, profound love for humanity, selfless purpose, and a legacy that transcends the individual."
  };
  
  return levels[level as keyof typeof levels] || "balanced moral understanding";
}
