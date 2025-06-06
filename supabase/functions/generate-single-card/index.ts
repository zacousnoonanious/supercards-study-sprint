
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_PROMPT_LENGTH = 500;
const ALLOWED_STYLES = ['basic', 'detailed', 'quiz', 'definitions'];

const validateInput = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.prompt || typeof data.prompt !== 'string') {
    errors.push('Prompt is required and must be a string');
  } else if (data.prompt.length > MAX_PROMPT_LENGTH) {
    errors.push(`Prompt must be ${MAX_PROMPT_LENGTH} characters or less`);
  } else if (data.prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty');
  }

  if (!data.style || !ALLOWED_STYLES.includes(data.style)) {
    errors.push(`Style must be one of: ${ALLOWED_STYLES.join(', ')}`);
  }

  // Check for potentially malicious content
  const suspiciousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /forget\s+everything/i,
    /system\s+prompt/i,
    /jailbreak/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(data.prompt)) {
      errors.push('Prompt contains potentially unsafe content');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const sanitizeContent = (content: string): string => {
  return content
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style } = await req.json();

    // Validate input
    const validation = validateInput({ prompt, style });
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.errors }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const sanitizedPrompt = sanitizeContent(prompt);

    const systemPrompt = `You are a helpful assistant that creates educational flashcards. Generate exactly 1 flashcard based on the user's prompt. Format your response as a JSON object with "question" and "answer" properties. Make the content educational and appropriate. Keep the question concise (under 200 characters) and answer informative but not too long (under 500 characters).`;

    const userPrompt = `Create 1 flashcard about: ${sanitizedPrompt}. Style: ${style}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate flashcard', details: errorData }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    try {
      let flashcard = JSON.parse(content);
      
      // Sanitize the generated content
      if (flashcard && typeof flashcard === 'object') {
        flashcard = {
          question: flashcard.question ? sanitizeContent(flashcard.question).substring(0, 200) : '',
          answer: flashcard.answer ? sanitizeContent(flashcard.answer).substring(0, 500) : ''
        };
      }

      return new Response(
        JSON.stringify({ flashcard }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', details: content }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in generate-single-card function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
