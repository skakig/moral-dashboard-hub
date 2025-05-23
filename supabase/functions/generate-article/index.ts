
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error("OpenAI API key is not configured");
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Safely parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Invalid request body:", parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body: ' + parseError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { 
      theme = '', 
      keywords = [], 
      contentType = 'blog post', 
      moralLevel = 5, 
      platform = 'General', 
      contentLength = 'medium', 
      tone = 'informative' 
    } = requestBody;
    
    if (!theme) {
      console.error("Theme is required but not provided");
      return new Response(
        JSON.stringify({ error: 'Theme is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Generating ${contentType} about "${theme}" with moral level ${moralLevel}`);
    
    // Format the keywords for the prompt
    const keywordString = Array.isArray(keywords) && keywords.length > 0 
      ? `and include these keywords where appropriate: ${keywords.join(', ')}` 
      : '';

    // Define prompt based on content length
    let sizePrompt = '';
    if (contentLength === 'short') {
      sizePrompt = 'Keep it concise, around 300-400 words.';
    } else if (contentLength === 'long') {
      sizePrompt = 'Make it detailed and comprehensive, around 1000-1200 words.';
    } else {
      sizePrompt = 'Aim for about 600-800 words.';
    }

    // Define prompt based on tone
    let tonePrompt = '';
    switch(tone) {
      case 'professional':
        tonePrompt = 'Use a professional and formal tone';
        break;
      case 'conversational':
        tonePrompt = 'Write in a conversational and friendly tone';
        break;
      case 'motivational':
        tonePrompt = 'Use an inspiring and motivational tone';
        break;
      default:
        tonePrompt = 'Write in an informative and engaging tone';
    }

    // Construct system prompt based on moral level
    const moralSystemPrompt = `You specialize in creating content that reflects moral development level ${moralLevel} on a scale of 1-9, where:
    - Level 1-3: Basic survival, self-interest, and social conformity morality
    - Level 4-6: Higher principles, fairness, empathy, and altruism
    - Level 7-9: Integrity, virtue, and transcendent moral perspectives
    Target your writing to be accessible and appealing to someone at moral level ${moralLevel}.`;

    // Main user prompt
    const mainPrompt = `Create a ${contentType} about "${theme}" for the ${platform} platform. ${sizePrompt} ${tonePrompt} ${keywordString}
    
    Also generate:
    1. An engaging title
    2. A compelling meta description for SEO (under 160 characters)
    
    Format your response as a JSON object with these keys:
    {
      "title": "Your Title Here",
      "content": "Your main content here with proper paragraphs and formatting",
      "metaDescription": "Your meta description here",
      "keywords": ["keyword1", "keyword2"]
    }`;

    console.log("Sending request to OpenAI API");
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAIApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using a reliable, fast model
          messages: [
            {
              role: "system",
              content: moralSystemPrompt
            },
            {
              role: "user",
              content: mainPrompt
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        return new Response(
          JSON.stringify({ error: 'Failed to generate content', details: errorData.error?.message || 'API response error' }),
          { 
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log("Received response from OpenAI");
      const openAiResponse = await response.json();
      
      // Check if we got a valid response
      if (!openAiResponse.choices || openAiResponse.choices.length === 0) {
        console.error("Invalid response from OpenAI:", openAiResponse);
        return new Response(
          JSON.stringify({ error: 'Failed to generate content', details: openAiResponse.error?.message || 'Unknown error' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      let result;
      const content = openAiResponse.choices[0].message.content;
      console.log("Got content from OpenAI, parsing...");
      
      try {
        // Try to parse the response as JSON
        // Find JSON object in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        
        try {
          result = JSON.parse(jsonString);
        } catch (innerError) {
          // If direct parsing fails, try a more lenient approach
          console.warn("Direct JSON parsing failed, trying alternative approach:", innerError);
          
          // Try to extract the JSON structure with regex
          const titleMatch = content.match(/"title":\s*"([^"]*)"/);
          const contentMatch = content.match(/"content":\s*"([^"]*)"/);
          const metaMatch = content.match(/"metaDescription":\s*"([^"]*)"/);
          
          if (titleMatch || contentMatch) {
            result = {
              title: titleMatch ? titleMatch[1] : theme,
              content: contentMatch ? contentMatch[1] : content,
              metaDescription: metaMatch ? metaMatch[1] : '',
              keywords: []
            };
          } else {
            // Ultimate fallback - use the raw text
            result = {
              title: theme || "Generated Content",
              content: content,
              metaDescription: '',
              keywords: []
            };
          }
        }
        
        // Validate required fields
        if (!result.title) {
          result.title = theme || "Generated Content";
        }
        
        if (!result.content) {
          result.content = content;
        }
        
        console.log("Generated content successfully:", {
          title: result.title,
          contentLength: result.content?.length || 0,
          hasMetaDescription: Boolean(result.metaDescription)
        });
        
        // Return the formatted result
        return new Response(
          JSON.stringify(result),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (error) {
        console.error("Error parsing OpenAI response:", error);
        console.log("Raw content:", content);
        
        // Try to extract a title and content from the raw text as a fallback
        let title = theme || 'Generated Content';
        let extractedContent = content;
        
        // Try to split by newlines and extract a title
        const lines = content.split('\n');
        if (lines.length > 0) {
          // Use the first non-empty line as title
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('{') && !trimmedLine.startsWith('"')) {
              title = trimmedLine.replace(/^#+ /, ''); // Remove markdown headings
              break;
            }
          }
          
          // Use the rest as content
          if (title !== theme) {
            extractedContent = lines.slice(1).join('\n').trim();
          }
        }
        
        return new Response(
          JSON.stringify({ 
            title: title,
            content: extractedContent,
            metaDescription: '',
            keywords: []
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (apiError) {
      console.error("Error calling OpenAI API:", apiError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate content', details: apiError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error("Error in generate-article function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error during content generation' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
