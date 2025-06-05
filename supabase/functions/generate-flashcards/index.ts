
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { prompt, style, setId, userId } = await req.json();

    console.log('Generating flashcards with prompt:', prompt, 'style:', style);

    // Create the system prompt based on the selected style
    let systemPrompt = '';
    switch (style) {
      case 'funny':
        systemPrompt = 'You are a witty and humorous educational assistant. Create flashcards that are entertaining and memorable while still being educational. Use humor, wordplay, and fun examples to make learning enjoyable.';
        break;
      case 'analytical':
        systemPrompt = 'You are a precise and analytical educational assistant. Create flashcards that focus on detailed analysis, breaking down complex concepts into logical components, and providing thorough explanations.';
        break;
      case 'creative':
        systemPrompt = 'You are a creative and imaginative educational assistant. Create flashcards using metaphors, analogies, storytelling, and visual descriptions to make concepts memorable and engaging.';
        break;
      case 'concise':
        systemPrompt = 'You are a direct and efficient educational assistant. Create flashcards that are clear, concise, and to-the-point. Focus on essential information without unnecessary elaboration.';
        break;
      default:
        systemPrompt = 'You are a helpful educational assistant. Create clear and informative flashcards that effectively teach the requested topic.';
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
          { 
            role: 'system', 
            content: `${systemPrompt}

Generate exactly 5 flashcards about the given topic. Return the response as a valid JSON array with this exact structure:
[
  {
    "question": "Front side question/prompt",
    "answer": "Back side answer/explanation"
  }
]

Make sure each flashcard has a clear question on the front and a comprehensive answer on the back. The content should match the requested style (${style}).`
          },
          { role: 'user', content: `Create flashcards about: ${prompt}` }
        ],
        temperature: style === 'funny' || style === 'creative' ? 0.8 : 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content:', generatedContent);

    // Parse the JSON response
    let flashcards;
    try {
      flashcards = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Insert flashcards into the database
    const insertPromises = flashcards.map((card: any) => {
      const defaultFrontElement = {
        id: `front-text-${Date.now()}-${Math.random()}`,
        type: 'text',
        x: 150,
        y: 180,
        width: 300,
        height: 60,
        rotation: 0,
        content: card.question,
        fontSize: 24,
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center'
      };

      const defaultBackElement = {
        id: `back-text-${Date.now()}-${Math.random()}`,
        type: 'text',
        x: 150,
        y: 180,
        width: 300,
        height: 60,
        rotation: 0,
        content: card.answer,
        fontSize: 24,
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center'
      };

      return supabase
        .from('flashcards')
        .insert({
          set_id: setId,
          question: card.question,
          answer: card.answer,
          front_elements: [defaultFrontElement],
          back_elements: [defaultBackElement]
        });
    });

    await Promise.all(insertPromises);

    // Update the generation status
    await supabase
      .from('ai_flashcard_generations')
      .insert({
        user_id: userId,
        set_id: setId,
        prompt,
        style,
        status: 'completed'
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${flashcards.length} flashcards successfully`,
        flashcards 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-flashcards function:', error);
    
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
