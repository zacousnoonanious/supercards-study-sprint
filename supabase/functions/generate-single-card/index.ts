
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, cardType, interactiveType } = await req.json();

    console.log('Generating single card with prompt:', prompt, 'cardType:', cardType, 'interactiveType:', interactiveType);

    let systemPrompt = '';
    let userPrompt = prompt;

    if (interactiveType === 'multiple-choice') {
      systemPrompt = 'You are an educational assistant. Create a multiple choice question based on the given prompt. Return the response as a valid JSON object with this structure: {"question": "Question text", "answer": "Correct answer", "mcOptions": ["Option 1", "Option 2", "Option 3", "Option 4"], "correctAnswer": 0}. Make sure one of the options is the correct answer and set correctAnswer to its index.';
    } else if (interactiveType === 'true-false') {
      systemPrompt = 'You are an educational assistant. Create a true/false question based on the given prompt. Return the response as a valid JSON object with this structure: {"question": "True or false statement", "answer": "true or false", "explanation": "Brief explanation"}';
    } else if (interactiveType === 'fill-blank') {
      systemPrompt = 'You are an educational assistant. Create a fill-in-the-blank question based on the given prompt. Return the response as a valid JSON object with this structure: {"question": "Statement with _____ for the blank", "answer": "Correct word/phrase for the blank"}';
    } else {
      systemPrompt = 'You are an educational assistant. Create a flashcard question and answer based on the given prompt. Return the response as a valid JSON object with this structure: {"question": "Front side question", "answer": "Back side answer"}';
    }

    if (cardType === 'informational') {
      systemPrompt += ' The card is informational, so provide more detailed content suitable for extended reading.';
    } else if (cardType === 'no-back') {
      systemPrompt += ' This is a no-back card, so focus on making the question/statement comprehensive and self-contained.';
    }

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content:', generatedContent);

    let card;
    try {
      card = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        card
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-single-card function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
