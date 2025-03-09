
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Check multiple possible environment variable names for the OpenAI API key
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || 
                    Deno.env.get('OPEN_AI_TMH') || 
                    Deno.env.get('OPEN-AI-CUSTOM-GPT');

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
    console.log("Received request to generate-seo-data function");
    
    if (!openAIApiKey) {
      console.error("OpenAI API key is missing");
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error', 
          details: 'OpenAI API key is not configured' 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { content, theme, platform, contentType } = await req.json();

    if (!content && !theme) {
      return new Response(
        JSON.stringify({ error: 'Content or theme is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Generating SEO data for platform: ${platform}, content type: ${contentType}`);

    // Format the prompt based on the platform and content type
    let platformSpecificInstructions = '';
    
    switch(platform) {
      case 'Instagram':
        platformSpecificInstructions = 'Include popular and relevant Instagram hashtags. Focus on engagement and visual appeal.';
        break;
      case 'YouTube':
        platformSpecificInstructions = 'Include SEO-optimized keywords for YouTube search. Focus on clickability and viewer retention.';
        break;
      case 'Twitter':
        platformSpecificInstructions = 'Include popular Twitter hashtags and ensure brevity. Focus on shareable content.';
        break;
      case 'TikTok':
        platformSpecificInstructions = 'Include trending TikTok hashtags and sounds references if appropriate. Focus on viral potential.';
        break;
      default:
        platformSpecificInstructions = 'Focus on general SEO best practices for discoverability and engagement.';
    }

    // Send request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are an SEO and social media expert for The Moral Hierarchy, a platform focused on moral development and ethical growth. You need to generate:
            
            1. A concise, SEO-friendly meta description (max 160 characters) that summarizes the content and includes key keywords.
            2. A list of 5-10 relevant keywords or hashtags appropriate for the platform.
            
            ${platformSpecificInstructions}
            
            Return your response in JSON format with "metaDescription" and "keywords" (array) fields.`
          },
          { 
            role: 'user', 
            content: `Generate SEO data for ${platform || 'general'} ${contentType || 'content'} with theme: "${theme || ''}" and content: "${content?.substring(0, 500) || ''}"` 
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error('Invalid OpenAI response:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to generate SEO data', details: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Parse the response - handle both JSON and non-JSON responses
    let seoData;
    try {
      const contentText = data.choices[0].message.content;
      
      // Try to parse as JSON
      try {
        seoData = JSON.parse(contentText);
      } catch (e) {
        // If not JSON, extract data using regex
        const metaDescriptionMatch = contentText.match(/meta\s*description[:\s]*(.*?)(?:\n|$)/i);
        const keywordsMatch = contentText.match(/keywords[:\s]*(.*?)(?:\n|$)/i);
        
        seoData = {
          metaDescription: metaDescriptionMatch ? metaDescriptionMatch[1].trim() : 'Generated meta description',
          keywords: keywordsMatch 
            ? keywordsMatch[1].split(/,|\n/).map(k => k.trim()).filter(Boolean) 
            : ['moral', 'ethics', 'development']
        };
      }
    } catch (error) {
      console.error('Error parsing SEO data:', error);
      seoData = {
        metaDescription: "Content about moral development and ethical growth.",
        keywords: ['moral hierarchy', 'ethics', 'development']
      };
    }

    return new Response(
      JSON.stringify(seoData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating SEO data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
