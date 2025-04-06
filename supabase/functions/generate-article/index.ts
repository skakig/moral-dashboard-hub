
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
    // Try multiple potential API key environment variables
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || 
                        Deno.env.get("OPEN_AI_TMH") || 
                        Deno.env.get("OPENAI_KEY") ||
                        Deno.env.get("OPENAI_SECRET");
    
    if (!openAIApiKey) {
      console.error("Missing API key: No OpenAI API key found in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API key not configured. Please set an OpenAI API key in your environment variables." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Parse request data with more robust error handling
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format. Please provide valid JSON.", 
          details: parseError instanceof Error ? parseError.message : String(parseError)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
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
      return new Response(
        JSON.stringify({ error: "Theme parameter is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Generating ${contentType} for ${platform} with moral level ${moralLevel}`);
    console.log(`Theme: ${theme.substring(0, 100)}${theme.length > 100 ? '...' : ''}`);
    
    // Content length to approximate token length guidance
    const tokenLimits = {
      short: 250,
      medium: 500,
      long: 800,
    };
    
    const tokenLimit = tokenLimits[contentLength as keyof typeof tokenLimits] || tokenLimits.medium;
    
    // Format keywords as string
    const keywordsString = Array.isArray(keywords) && keywords.length > 0 
      ? `Keywords: ${keywords.join(', ')}`
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
  "keywords": ["keyword1", "keyword2"]
}`;

    try {
      // Use gpt-3.5-turbo for faster responses
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAIApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // More stable and faster model
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
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
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
        );
      }

      const responseData = await response.json();
      const generatedText = responseData.choices[0].message.content;
      
      // Parse the JSON response from OpenAI with better error handling
      let parsedContent;
      try {
        // Try different approaches to extract JSON
        const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                          generatedText.match(/```\s*([\s\S]*?)\s*```/) || 
                          generatedText.match(/{[\s\S]*}/);
                          
        const jsonString = jsonMatch 
          ? jsonMatch[0].replace(/```json|```/g, '') 
          : generatedText;
        
        parsedContent = JSON.parse(jsonString);
        
        // Ensure we have required fields
        if (!parsedContent.title || !parsedContent.content) {
          throw new Error("Missing required fields in generated content");
        }
      } catch (error) {
        console.error("Error parsing generated content:", error);
        console.log("Raw content:", generatedText.substring(0, 500));
        
        // If JSON parsing fails, create a structured response from the raw text
        const lines = generatedText.split('\n');
        let title = theme;
        let content = generatedText;
        
        // Try to extract a title from the first line
        if (lines.length > 0) {
          const potentialTitle = lines[0].replace(/^#+ |^Title: /, '').trim();
          if (potentialTitle && potentialTitle.length < 100) {
            title = potentialTitle;
          }
        }
        
        parsedContent = { 
          title: title, 
          content: content, 
          metaDescription: `${theme.substring(0, 150)}...`,
          keywords: []
        };
      }
      
      console.log("Successfully generated content with title:", parsedContent.title);
      
      return new Response(
        JSON.stringify(parsedContent),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (apiError) {
      console.error("Error calling OpenAI API:", apiError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate content with OpenAI", 
          details: apiError instanceof Error ? apiError.message : String(apiError)
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
  } catch (error) {
    console.error("Content generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate content",
        details: String(error)
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
