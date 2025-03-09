
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { theme, keywords, contentType, moralLevel, platform = "general", contentLength = "medium" } = await req.json();

    // Construct the prompt based on TMH knowledge
    const tmhContext = `The Moral Hierarchy (TMH) is a framework with 9 levels of moral development:
    1. Self-Preservation (Survival Morality)
    2. Self-Interest (Pragmatic Morality)
    3. Social Contract (Cooperative Morality)
    4. Fairness (Justice Morality)
    5. Empathy (Relational Morality)
    6. Altruism (Sacrificial Morality)
    7. Integrity (Principled Morality)
    8. Virtue (Aspiring Morality)
    9. Self-Actualization (Transcendent Morality)
    
    Each level represents growing moral maturity, from basic survival to transcendent ethics.`;

    // Determine content length based on selection
    let targetLength: string;
    switch(contentLength) {
      case "short":
        targetLength = "300-500 words";
        break;
      case "long":
        targetLength = "2000-3000 words";
        break;
      default: // medium
        targetLength = "1000-1500 words";
    }

    // Adjust instructions based on content type and platform
    let contentSpecificInstructions = "";
    
    if (contentType.includes("social_media")) {
      contentSpecificInstructions = `
      Create a compelling social media post for ${platform} about ${keywords?.join(', ') || theme} that:
      1. Is optimized for ${platform} and ${contentLength} length
      2. Includes relevant hashtags and calls-to-action
      3. Has an engaging hook in the first 3 seconds/lines
      4. References moral hierarchy concepts in an accessible way
      5. Includes suggestions for visuals or graphics to accompany the post
      `;
    } else if (contentType.includes("youtube")) {
      contentSpecificInstructions = `
      Create a YouTube ${contentType.includes("shorts") ? "Shorts" : "script"} that:
      1. Has a strong hook in the first ${contentType.includes("shorts") ? "3" : "15"} seconds
      2. Includes timestamps and chapter markers
      3. Contains calls-to-action for engagement (like, subscribe)
      4. Balances educational content with engaging delivery
      5. Ends with a question to encourage comments
      `;
    } else if (platform === "Instagram" && contentType.includes("reels")) {
      contentSpecificInstructions = `
      Create a script for Instagram Reels that:
      1. Has a captivating first 3 seconds
      2. Includes trending audio suggestions
      3. Has clear, concise talking points
      4. Incorporates moral concepts in an engaging, visually-oriented way
      5. Suggests simple visual transitions or effects
      `;
    } else if (platform === "TikTok") {
      contentSpecificInstructions = `
      Create a TikTok script that:
      1. Has a viral-worthy hook in the first 3 seconds
      2. Uses trending sounds or concepts if relevant
      3. Is paced for the TikTok format (fast, engaging)
      4. Makes complex moral concepts approachable and entertaining
      5. Includes suggestions for simple visual effects
      `;
    } else if (contentType.includes("tweet")) {
      contentSpecificInstructions = `
      Create a Twitter thread that:
      1. Starts with a powerful, shareable first tweet
      2. Breaks complex ideas into tweet-sized chunks
      3. Uses numbering or clear connections between tweets
      4. Incorporates relevant hashtags strategically
      5. Ends with a call to action or thought-provoking question
      `;
    } else {
      contentSpecificInstructions = `
      Create high-quality, engaging ${contentType} on the theme of "${theme}" that:
      1. Includes clear headings and subheadings for structure
      2. Is factually accurate and well-researched  
      3. Includes practical examples and applications
      4. Ends with a clear call-to-action for the reader to take the TMH assessment
      5. Is conversational but authoritative in tone
      `;
    }

    console.log("Sending request to OpenAI with content type:", contentType, "platform:", platform);

    // Construct the system prompt
    const systemPrompt = `You are an expert content writer for The Moral Hierarchy (TMH), a platform focused on moral development and ethical growth. 
    ${tmhContext}
    
    ${contentSpecificInstructions}
    
    Your content should:
    1. Be written at moral development level ${moralLevel} (approximately)
    2. Incorporate these keywords naturally: ${keywords?.join(', ') || theme}
    3. Be approximately ${targetLength} in length
    4. Format the content in Markdown for easy reading

    If you encounter any challenges creating this content, focus on quality over keywords or length.`;

    console.log("Sending request to OpenAI with prompt:", systemPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create ${contentType} content for ${platform} about ${theme || keywords?.join(', ')} that would resonate with people interested in moral development.` }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error('Invalid OpenAI response:', data);
      return new Response(JSON.stringify({ error: 'Failed to generate content', details: data }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const generatedContent = data.choices[0].message.content;

    // Generate a meta description
    const metaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Create a concise, SEO-friendly meta description (max 160 characters) that summarizes the content and includes key keywords.' },
          { role: 'user', content: generatedContent }
        ],
        temperature: 0.5,
        max_tokens: 100,
      }),
    });

    const metaData = await metaResponse.json();
    const metaDescription = metaData.choices[0].message.content;

    // Generate a title
    const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Create a compelling, SEO-friendly title (max 70 characters) for this content that includes key keywords.' },
          { role: 'user', content: generatedContent }
        ],
        temperature: 0.7,
        max_tokens: 50,
      }),
    });

    const titleData = await titleResponse.json();
    const title = titleData.choices[0].message.content;

    return new Response(JSON.stringify({ 
      content: generatedContent,
      metaDescription,
      title,
      keywords
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating article:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
