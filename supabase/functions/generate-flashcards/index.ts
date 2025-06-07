
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_PROMPT_LENGTH = 500;
const MAX_CARDS_COUNT = 20;
const ALLOWED_STYLES = ['standard', 'concise', 'detailed', 'funny', 'creative'];

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

  if (data.cardCount && (typeof data.cardCount !== 'number' || data.cardCount < 1 || data.cardCount > MAX_CARDS_COUNT)) {
    errors.push(`Count must be a number between 1 and ${MAX_CARDS_COUNT}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const sanitizeContent = (content: string): string => {
  return content
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
};

const createQuizElement = (type: 'multiple-choice' | 'true-false', question: string, options?: string[], correctAnswer?: number | boolean, position: { x: number, y: number }) => {
  const baseElement = {
    id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    x: position.x,
    y: position.y,
    width: 400,
    height: type === 'multiple-choice' ? 300 : 200,
    rotation: 0,
    zIndex: 1,
    content: question,
    fontSize: 16,
    color: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'center' as const,
    showImmediateFeedback: true,
    autoAdvanceOnAnswer: false,
  };

  if (type === 'multiple-choice' && options) {
    return {
      ...baseElement,
      multipleChoiceOptions: options,
      correctAnswer: correctAnswer as number,
    };
  } else if (type === 'true-false') {
    return {
      ...baseElement,
      correctAnswer: correctAnswer === true ? 0 : 1, // 0 for True, 1 for False
    };
  }

  return baseElement;
};

const generateQuizPrompt = (topic: string, quizTypes: any, count: number) => {
  const enabledTypes = [];
  if (quizTypes.multipleChoice) enabledTypes.push('multiple choice');
  if (quizTypes.trueFalse) enabledTypes.push('true/false');
  
  return `Create ${count} quiz questions about: ${topic}. 
  
Use these question types: ${enabledTypes.join(' and ')}.
Mix the types evenly.

For multiple choice questions, provide exactly 4 options with 1 correct answer and 3 plausible distractors.
For true/false questions, create clear statements that are definitively true or false.

Format your response as a JSON array where each object has:
- "type": "multiple-choice" or "true-false"
- "question": the question text
- "options": array of 4 strings (only for multiple choice)
- "correctAnswer": number 0-3 for multiple choice (index of correct option), boolean true/false for true/false questions
- "explanation": brief explanation of why the answer is correct

Example:
[
  {
    "type": "multiple-choice",
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": 2,
    "explanation": "Paris is the capital and largest city of France."
  },
  {
    "type": "true-false", 
    "question": "The Earth is flat.",
    "correctAnswer": false,
    "explanation": "The Earth is approximately spherical in shape."
  }
]`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      style, 
      cardCount = 5, 
      setId, 
      userId,
      includeQuiz = false,
      quizPercentage = 30,
      quizTypes = { multipleChoice: true, trueFalse: true },
      mode = 'add-to-set'
    } = await req.json();

    const validation = validateInput({ prompt, style, cardCount });
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const sanitizedPrompt = sanitizeContent(prompt);

    // Calculate how many cards should be quiz vs regular
    const quizCardCount = includeQuiz ? Math.ceil((cardCount * quizPercentage) / 100) : 0;
    const regularCardCount = cardCount - quizCardCount;

    const cards = [];

    // Generate regular flashcards if needed
    if (regularCardCount > 0) {
      const regularSystemPrompt = `You are a helpful assistant that creates educational flashcards. Generate exactly ${regularCardCount} standard flashcards based on the user's prompt. Format your response as a JSON array of objects, each with "question" and "answer" properties. Keep questions concise (under 200 characters) and answers informative but not too long (under 500 characters).`;

      const regularUserPrompt = `Create ${regularCardCount} flashcards about: ${sanitizedPrompt}. Style: ${style}`;

      const regularResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: regularSystemPrompt },
            { role: 'user', content: regularUserPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (regularResponse.ok) {
        const regularData = await regularResponse.json();
        const regularContent = regularData.choices[0]?.message?.content;
        
        if (regularContent) {
          try {
            const regularCards = JSON.parse(regularContent);
            if (Array.isArray(regularCards)) {
              cards.push(...regularCards.map(card => ({ ...card, type: 'regular' })));
            }
          } catch (e) {
            console.error('Failed to parse regular cards:', e);
          }
        }
      }
    }

    // Generate quiz cards if needed
    if (quizCardCount > 0) {
      const quizPrompt = generateQuizPrompt(sanitizedPrompt, quizTypes, quizCardCount);

      const quizResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are an expert quiz creator. Generate educational quiz questions with accurate answers and plausible distractors.' },
            { role: 'user', content: quizPrompt }
          ],
          max_tokens: 3000,
          temperature: 0.7,
        }),
      });

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        const quizContent = quizData.choices[0]?.message?.content;
        
        if (quizContent) {
          try {
            const quizCards = JSON.parse(quizContent);
            if (Array.isArray(quizCards)) {
              cards.push(...quizCards.map(card => ({ ...card, type: 'quiz' })));
            }
          } catch (e) {
            console.error('Failed to parse quiz cards:', e);
          }
        }
      }
    }

    if (cards.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No cards generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create flashcards in database
    const createdCards = [];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      let frontElements = [];
      let backElements = [];

      if (card.type === 'quiz') {
        // Create quiz element positioned in center of card
        const quizElement = createQuizElement(
          card.type === 'multiple-choice' ? 'multiple-choice' : 'true-false',
          card.question,
          card.options,
          card.correctAnswer,
          { x: 200, y: 150 } // Center position for 800x600 canvas
        );
        
        frontElements.push(quizElement);
        
        // Add explanation as back element
        if (card.explanation) {
          backElements.push({
            id: `explanation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'text',
            x: 150,
            y: 200,
            width: 500,
            height: 200,
            rotation: 0,
            content: `Explanation: ${card.explanation}`,
            fontSize: 14,
            color: '#000000',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left' as const,
          });
        }
      } else {
        // Regular flashcard - create text elements
        frontElements.push({
          id: `front-text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          x: 150,
          y: 250,
          width: 500,
          height: 100,
          rotation: 0,
          content: card.question,
          fontSize: 18,
          color: '#000000',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center' as const,
        });

        backElements.push({
          id: `back-text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          x: 150,
          y: 200,
          width: 500,
          height: 200,
          rotation: 0,
          content: card.answer || '',
          fontSize: 16,
          color: '#000000',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center' as const,
        });
      }

      // Insert flashcard
      const { data: flashcard, error } = await supabase
        .from('flashcards')
        .insert({
          set_id: setId,
          question: card.question,
          answer: card.type === 'quiz' ? `Quiz: ${card.question}` : card.answer,
          front_elements: frontElements,
          back_elements: backElements,
          card_type: card.type === 'quiz' ? 'quiz-only' : 'standard',
          interactive_type: card.type === 'quiz' ? card.type : null,
          canvas_width: 800,
          canvas_height: 600,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating flashcard:', error);
      } else {
        createdCards.push(flashcard);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        cardCount: createdCards.length,
        quizCards: createdCards.filter(c => c.card_type === 'quiz-only').length,
        regularCards: createdCards.filter(c => c.card_type === 'standard').length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-flashcards function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
