
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
    const { 
      prompt, 
      style, 
      setId, 
      userId, 
      cardCount = 5, 
      includeQuiz = false, 
      quizPercentage = 20, 
      quizTypes = { multipleChoice: true, trueFalse: true },
      mode = 'add-to-set'
    } = await req.json();

    console.log('Generating flashcards with:', { prompt, style, cardCount, includeQuiz, quizPercentage, mode });

    // Validate cardCount
    const validCardCount = Math.min(15, Math.max(1, cardCount));
    
    // Calculate how many quiz cards to generate
    let quizCardCount = 0;
    let regularCardCount = validCardCount;
    
    if (includeQuiz && mode !== 'generate-quiz') {
      quizCardCount = Math.floor((validCardCount * quizPercentage) / 100);
      regularCardCount = validCardCount - quizCardCount;
    } else if (mode === 'generate-quiz') {
      quizCardCount = Math.min(10, Math.max(3, validCardCount));
      regularCardCount = 0;
    }

    console.log('Card distribution:', { regularCardCount, quizCardCount });

    let allFlashcards = [];

    // Generate regular flashcards if needed
    if (regularCardCount > 0) {
      const systemPrompt = getSystemPrompt(style);
      
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

Generate exactly ${regularCardCount} flashcards about the given topic. Return the response as a valid JSON array with this exact structure:
[
  {
    "question": "Front side question/prompt",
    "answer": "Back side answer/explanation"
  }
]

Make sure each flashcard has a clear question on the front and a comprehensive answer on the back. The content should match the requested style (${style}).`
            },
            { role: 'user', content: `Create ${regularCardCount} flashcards about: ${prompt}` }
          ],
          temperature: style === 'funny' || style === 'creative' ? 0.8 : 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const regularCards = JSON.parse(data.choices[0].message.content);
      allFlashcards = [...allFlashcards, ...regularCards.map((card: any) => ({ ...card, type: 'standard' }))];
    }

    // Generate quiz cards if needed
    if (quizCardCount > 0) {
      let quizPrompt = prompt;
      
      // If generating quiz for existing deck, get existing cards content
      if (mode === 'generate-quiz' && !prompt.trim()) {
        const { data: existingCards, error: cardsError } = await supabase
          .from('flashcards')
          .select('question, answer')
          .eq('set_id', setId)
          .limit(10);

        if (cardsError) throw cardsError;
        
        if (existingCards && existingCards.length > 0) {
          const cardContent = existingCards.map(card => `Q: ${card.question} A: ${card.answer}`).join('\n');
          quizPrompt = `Generate quiz questions based on this existing flashcard content:\n${cardContent}`;
        } else {
          throw new Error('No existing cards found to generate quiz from');
        }
      }

      const quizCards = await generateQuizCards(quizPrompt, quizCardCount, quizTypes, openAIApiKey);
      allFlashcards = [...allFlashcards, ...quizCards];
    }

    // Insert flashcards into the database
    const insertPromises = allFlashcards.map((card: any) => {
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

      const cardData: any = {
        set_id: setId,
        question: card.question,
        answer: card.answer,
        front_elements: [defaultFrontElement],
        back_elements: [defaultBackElement]
      };

      // Add interactive properties for quiz cards
      if (card.type !== 'standard') {
        cardData.interactive_type = card.type;
        if (card.type === 'multiple-choice') {
          cardData.interactive_data = {
            options: card.mcOptions,
            correctAnswer: card.correctAnswer
          };
        }
      }

      return supabase
        .from('flashcards')
        .insert(cardData);
    });

    await Promise.all(insertPromises);

    // Update the generation status
    await supabase
      .from('ai_flashcard_generations')
      .insert({
        user_id: userId,
        set_id: setId,
        prompt: prompt || 'Quiz generation from existing content',
        style: style || 'quiz',
        status: 'completed'
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${allFlashcards.length} flashcards successfully`,
        cardCount: allFlashcards.length,
        flashcards: allFlashcards,
        breakdown: {
          regular: regularCardCount,
          quiz: quizCardCount
        }
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

function getSystemPrompt(style: string): string {
  switch (style) {
    case 'funny':
      return 'You are a witty and humorous educational assistant. Create flashcards that are entertaining and memorable while still being educational. Use humor, wordplay, and fun examples to make learning enjoyable.';
    case 'analytical':
      return 'You are a precise and analytical educational assistant. Create flashcards that focus on detailed analysis, breaking down complex concepts into logical components, and providing thorough explanations.';
    case 'creative':
      return 'You are a creative and imaginative educational assistant. Create flashcards using metaphors, analogies, storytelling, and visual descriptions to make concepts memorable and engaging.';
    case 'concise':
      return 'You are a direct and efficient educational assistant. Create flashcards that are clear, concise, and to-the-point. Focus on essential information without unnecessary elaboration.';
    default:
      return 'You are a helpful educational assistant. Create clear and informative flashcards that effectively teach the requested topic.';
  }
}

async function generateQuizCards(prompt: string, count: number, quizTypes: any, apiKey: string) {
  const quizCards = [];
  const typesToGenerate = [];
  
  if (quizTypes.multipleChoice) typesToGenerate.push('multiple-choice');
  if (quizTypes.trueFalse) typesToGenerate.push('true-false');
  
  if (typesToGenerate.length === 0) {
    typesToGenerate.push('multiple-choice'); // fallback
  }

  for (let i = 0; i < count; i++) {
    const quizType = typesToGenerate[i % typesToGenerate.length];
    
    let systemPrompt = '';
    if (quizType === 'multiple-choice') {
      systemPrompt = 'Create a multiple choice question based on the given content. Return a JSON object with: {"question": "Question text", "answer": "Correct answer explanation", "mcOptions": ["Option 1", "Option 2", "Option 3", "Option 4"], "correctAnswer": 0, "type": "multiple-choice"}. The correctAnswer should be the index of the correct option.';
    } else {
      systemPrompt = 'Create a true/false question based on the given content. Return a JSON object with: {"question": "True or false statement", "answer": "Explanation of why it\'s true or false", "type": "true-false"}';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      try {
        const quizCard = JSON.parse(data.choices[0].message.content);
        quizCards.push(quizCard);
      } catch (parseError) {
        console.error('Failed to parse quiz card:', parseError);
        // Add a fallback standard card
        quizCards.push({
          question: `Quiz Question ${i + 1}`,
          answer: 'Generated quiz card',
          type: 'standard'
        });
      }
    }
  }

  return quizCards;
}
