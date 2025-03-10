
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

    // Determine the appropriate model to use
    const model = "gpt-4o-mini"; // Use a smaller, faster model for SEO keywords

    // Create a prompt to generate SEO keywords
    const prompt = `Generate 10 SEO-friendly hashtags and keywords for ${contentType || 'content'} about "${theme}" for ${platform || 'social media'}. 
    Format the response as an array of keywords without any explanations or additional text.
    Make sure the keywords are relevant, trending, and optimized for discovery.`;

    // Call OpenAI API with retry logic
    let response = null;
    let retries = 3;
    let delay = 1000; // Start with 1 second delay
    
    while (retries > 0) {
      try {
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openAIApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: "You are an SEO expert who generates effective keywords and hashtags." },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
          }),
        });
        
        // If successful or response is not a rate limit error, break the loop
        if (response.ok || response.status !== 429) {
          break;
        }
        
        // Handle rate limit
        console.log(`Rate limited. Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        retries--;
      } catch (e) {
        console.error("Error calling OpenAI:", e);
        retries--;
        
        if (retries === 0) throw e;
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    if (!response || !response.ok) {
      // If we still have an error after retries, handle it
      let errorMessage = "Failed to generate keywords";
      try {
        const errorData = await response?.json();
        errorMessage = errorData?.error?.message || response?.statusText || errorMessage;
      } catch (e) {
        // If we can't parse the error, use the default message
      }
      
      console.error("OpenAI API error:", errorMessage);
      
      // If we can't generate keywords, return a fallback set
      return new Response(
        JSON.stringify({ 
          success: true,
          keywords: generateFallbackKeywords(theme, platform, contentType)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      // If no keywords generated, return fallback keywords
      return new Response(
        JSON.stringify({ 
          success: true,
          keywords: generateFallbackKeywords(theme, platform, contentType)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
    
    // If we still don't have any keywords, use fallback keywords
    if (keywords.length === 0) {
      keywords = generateFallbackKeywords(theme, platform, contentType);
    }
    
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

// Function to generate fallback keywords if OpenAI fails
function generateFallbackKeywords(theme: string, platform: string, contentType: string): string[] {
  // Generate basic keywords based on the theme, platform, and content type
  const baseKeywords = theme.split(/\s+/).filter(word => word.length > 3).map(word => '#' + word.replace(/[^a-zA-Z0-9]/g, ''));
  
  // Add platform-specific keywords
  const platformKeywords: Record<string, string[]> = {
    'YouTube': ['#YouTubeContent', '#YouTubeVideo', '#YouTubeCreator'],
    'Instagram': ['#InstagramContent', '#InstagramPost', '#InstaDaily'],
    'Twitter': ['#TwitterContent', '#TweetThis', '#TwitterTips'],
    'Facebook': ['#FacebookContent', '#FacebookPost', '#FacebookTips'],
    'LinkedIn': ['#LinkedInContent', '#CareerTips', '#ProfessionalDevelopment'],
    'TikTok': ['#TikTokContent', '#TikTokCreator', '#TikTokTips'],
    'Website': ['#WebContent', '#BlogPost', '#WebsiteContent']
  };
  
  // Add content type keywords
  const contentTypeKeywords: Record<string, string[]> = {
    'article': ['#Article', '#ContentCreation', '#Writing'],
    'blog_post': ['#BlogPost', '#Blogging', '#ContentMarketing'],
    'social_media': ['#SocialMedia', '#SocialContent', '#DigitalMarketing'],
    'youtube_script': ['#YouTubeScript', '#VideoScript', '#ContentCreation'],
    'youtube_shorts': ['#Shorts', '#ShortVideo', '#ShortContent'],
    'youtube_description': ['#VideoDescription', '#YouTubeSEO', '#VideoContent'],
    'tweet_thread': ['#TwitterThread', '#Thread', '#TwitterContent'],
    'carousel': ['#Carousel', '#CarouselPost', '#SlideShow'],
    'reels_script': ['#ReelsScript', '#ReelsContent', '#ShortFormContent'],
    'script': ['#Script', '#ContentScript', '#CreativeWriting']
  };
  
  // Add some moral hierarchy related keywords
  const moralKeywords = ['#MoralHierarchy', '#Ethics', '#MoralDevelopment', '#Values'];
  
  // Combine all keywords
  let allKeywords = [
    ...baseKeywords,
    ...(platformKeywords[platform] || []),
    ...(contentTypeKeywords[contentType] || []),
    ...moralKeywords
  ];
  
  // Remove duplicates and ensure we have at most 10 keywords
  return [...new Set(allKeywords)].slice(0, 10);
}
