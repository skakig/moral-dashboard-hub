
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
    const { theme, keywords, contentType, moralLevel } = await req.json();

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

    // Construct the system prompt
    const systemPrompt = `You are an expert content writer for The Moral Hierarchy (TMH), a platform focused on moral development and ethical growth. 
    ${tmhContext}
    
    Create high-quality, engaging ${contentType} on the theme of "${theme}" that incorporates these keywords: ${keywords.join(', ')}.
    
    Your content should:
    1. Be written at an appropriate moral development level (approximately Level ${moralLevel}) 
    2. Include clear headings and subheadings for structure
    3. Be factually accurate and well-researched
    4. Include practical examples and applications
    5. End with a clear call-to-action for the reader to take the TMH assessment
    6. Be conversational but authoritative in tone
    7. Be approximately 1500-2000 words in length for articles
    
    Format the content in Markdown.`;

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
          { role: 'user', content: `Create a ${contentType} about ${theme} that would resonate with people interested in moral development.` }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error('Invalid OpenAI response:', data);
      return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
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
