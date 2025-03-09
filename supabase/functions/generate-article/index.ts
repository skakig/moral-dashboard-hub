
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
      throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY or OPEN_AI_TMH environment variable.");
    }

    const requestData = await req.json().catch(e => {
      console.error("Failed to parse request JSON:", e);
      throw new Error("Invalid request format");
    });
    
    const {
      theme, 
      keywords = [], 
      contentType = "article", 
      moralLevel = 5, 
      platform = "web",
      contentLength = "medium",
      tone = "informative"
    } = requestData;

    if (!theme) {
      throw new Error("Theme parameter is required");
    }

    console.log(`Generating ${contentType} for ${platform} with moral level ${moralLevel}`);
    console.log(`Theme: ${theme.substring(0, 100)}${theme.length > 100 ? '...' : ''}`);
    console.log(`Content length: ${contentLength}`);
    
    // Content length to approximate token length guidance
    const tokenLimits = {
      short: 250,
      medium: 800,
      long: 1500,
      "in-depth": 3000,
      comprehensive: 5000,
    };
    
    const tokenLimit = tokenLimits[contentLength as keyof typeof tokenLimits] || tokenLimits.medium;
    const modelToUse = contentLength === "in-depth" || contentLength === "comprehensive" 
      ? "gpt-4o" // Use more powerful model for longer content
      : "gpt-4o-mini"; // Use faster model for shorter content
    
    // Format keywords as string
    const keywordsString = keywords.length > 0 
      ? `Keywords: ${Array.isArray(keywords) ? keywords.join(', ') : keywords}`
      : 'Generate appropriate keywords for this content';

    // Optimize prompt for faster generation
    const systemMessage = `You are a content generator specialized in creating moral and ethical content aligned with TMH (The Moral Hierarchy) framework. 
Focus on level ${moralLevel} of the moral hierarchy. Generate quality content efficiently and quickly.`;

    const userPrompt = `Create a ${contentLength} ${contentType} for ${platform} with a ${tone} tone about:
"${theme}"

${keywordsString}

Content should align with moral level ${moralLevel}/9 in the TMH framework.
Limit to approximately ${tokenLimit} words.

Return ONLY a JSON object with this structure:
{
  "title": "A catchy title",
  "content": "The main content", 
  "metaDescription": "A brief SEO description",
  "keywords": ["keyword1", "keyword2"]  // Optional array of relevant hashtags/keywords
}`;

    console.log(`Using model: ${modelToUse} with token limit: ${tokenLimit}`);
    
    // Use gpt-4o for more complex or longer content
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: Math.min(4096, tokenLimit * 2), // Scale token limit based on content length
      }),
    }).catch(error => {
      console.error("Network error calling OpenAI:", error);
      throw new Error("Failed to connect to OpenAI API. Please try again.");
    });

    if (!response.ok) {
      let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // Use default error message if we can't parse the response
      }
      
      console.error("OpenAI API error:", errorMessage);
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    const generatedText = responseData.choices[0].message.content;
    
    // Parse the JSON response from OpenAI
    let parsedContent;
    try {
      // Try to extract JSON if it's wrapped in any code blocks or text
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        generatedText.match(/```\s*([\s\S]*?)\s*```/) || 
                        generatedText.match(/{[\s\S]*}/);
                        
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : generatedText;
      parsedContent = JSON.parse(jsonString);
      
      // Ensure we have required fields
      if (!parsedContent.title || !parsedContent.content) {
        throw new Error("Missing required fields in generated content");
      }
    } catch (error) {
      console.error("Error parsing generated content:", error);
      console.log("Raw content:", generatedText.substring(0, 500));
      
      // If JSON parsing fails, try to create a structured response from the raw text
      const title = generatedText.split('\n')[0].replace(/^#+ /, '').trim();
      const content = generatedText;
      parsedContent = { 
        title: title || theme, 
        content: content || "Failed to generate structured content", 
        metaDescription: theme
      };
    }
    
    console.log("Successfully generated content with title:", parsedContent.title);
    
    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Content generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate content",
        details: error.toString() 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
