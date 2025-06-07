
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

const createTextElement = (content: string, position: { x: number, y: number }, size: { width: number, height: number }, fontSize: number = 16) => {
  return {
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'text',
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    rotation: 0,
    zIndex: 1,
    content,
    fontSize,
    color: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'center' as const,
  };
};

const createImageElement = (imageUrl: string, position: { x: number, y: number }, size: { width: number, height: number }) => {
  return {
    id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'image',
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    rotation: 0,
    zIndex: 1,
    imageUrl,
  };
};

const fetchWikipediaImages = async (topic: string, count: number = 3): Promise<string[]> => {
  try {
    // Search for Wikipedia articles related to the topic
    const searchResponse = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/search/title?q=${encodeURIComponent(topic)}&limit=3`
    );
    
    if (!searchResponse.ok) return [];
    
    const searchData = await searchResponse.json();
    const images: string[] = [];
    
    // Get images from the top search results
    for (const page of searchData.pages || []) {
      try {
        const pageResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(page.key)}`
        );
        
        if (pageResponse.ok) {
          const mediaData = await pageResponse.json();
          const pageImages = mediaData.items
            ?.filter((item: any) => 
              item.type === 'image' && 
              item.srcset && 
              !item.title.toLowerCase().includes('commons-logo') &&
              !item.title.toLowerCase().includes('edit-icon')
            )
            .slice(0, 2)
            .map((item: any) => {
              // Extract the highest resolution image URL
              const srcset = item.srcset.find((src: any) => src.scale && src.scale >= 1.5) || item.srcset[0];
              return srcset?.src;
            })
            .filter(Boolean);
          
          if (pageImages) {
            images.push(...pageImages);
          }
        }
      } catch (error) {
        console.error('Error fetching images for page:', page.key, error);
      }
      
      if (images.length >= count) break;
    }
    
    return images.slice(0, count);
  } catch (error) {
    console.error('Error fetching Wikipedia images:', error);
    return [];
  }
};

const generateInformationalContent = async (topic: string, style: string, cardCount: number) => {
  const systemPrompt = `You are an educational content creator. Create ${cardCount} informational slides about: ${topic}. 

Create a logical sequence starting with a title slide, then introductory content, followed by detailed information slides.

Format your response as a JSON array of objects, each with:
- "type": "title" | "introduction" | "content" 
- "title": brief title for the slide
- "content": main text content (keep under 400 characters for readability)
- "imageQuery": specific search term for finding relevant Wikipedia images (e.g., "medieval castle architecture", "castle siege weapons")

Style: ${style}

Example format:
[
  {
    "type": "title",
    "title": "History of Castles",
    "content": "An exploration of medieval fortifications",
    "imageQuery": "medieval castle"
  },
  {
    "type": "introduction", 
    "title": "What Are Castles?",
    "content": "Castles were fortified residences built primarily during the Middle Ages...",
    "imageQuery": "castle architecture"
  }
]`;

  return systemPrompt;
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
    "question": "What was the primary purpose of castle moats?",
    "options": ["Decoration", "Defense against attackers", "Water storage", "Fish farming"],
    "correctAnswer": 1,
    "explanation": "Moats were defensive features designed to prevent attackers from reaching castle walls."
  },
  {
    "type": "true-false", 
    "question": "All medieval castles had drawbridges.",
    "correctAnswer": false,
    "explanation": "Not all castles had drawbridges; some used fixed bridges or other entrance methods."
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

    // Calculate content distribution - favor informational content
    const quizCardCount = includeQuiz ? Math.ceil((cardCount * quizPercentage) / 100) : 0;
    const informationalCardCount = cardCount - quizCardCount;

    const cards = [];

    // Generate informational content slides first
    if (informationalCardCount > 0) {
      const infoPrompt = generateInformationalContent(sanitizedPrompt, style, informationalCardCount);

      const infoResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: infoPrompt },
            { role: 'user', content: `Create ${informationalCardCount} informational slides about: ${sanitizedPrompt}` }
          ],
          max_tokens: 3000,
          temperature: 0.7,
        }),
      });

      if (infoResponse.ok) {
        const infoData = await infoResponse.json();
        const infoContent = infoData.choices[0]?.message?.content;
        
        if (infoContent) {
          try {
            const infoCards = JSON.parse(infoContent);
            if (Array.isArray(infoCards)) {
              // Fetch images for informational content
              const images = await fetchWikipediaImages(sanitizedPrompt, informationalCardCount);
              
              // Add images to info cards
              infoCards.forEach((card, index) => {
                card.type = 'informational';
                card.imageUrl = images[index % images.length] || null;
              });
              
              cards.push(...infoCards);
            }
          } catch (e) {
            console.error('Failed to parse informational cards:', e);
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
          model: 'gpt-4o-mini',
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

    // Create an ordered sequence: info -> quiz -> info -> quiz
    const orderedCards = [];
    const infoCards = cards.filter(card => card.type === 'informational');
    const quizCards = cards.filter(card => card.type === 'quiz');
    
    let infoIndex = 0;
    let quizIndex = 0;
    
    for (let i = 0; i < cardCount; i++) {
      if (i % 3 === 2 && quizIndex < quizCards.length) {
        // Every 3rd card (after 2 info cards), add a quiz
        orderedCards.push(quizCards[quizIndex++]);
      } else if (infoIndex < infoCards.length) {
        orderedCards.push(infoCards[infoIndex++]);
      } else if (quizIndex < quizCards.length) {
        // Fill remaining slots with quiz cards
        orderedCards.push(quizCards[quizIndex++]);
      }
    }

    // Create flashcards in database
    const createdCards = [];
    for (let i = 0; i < orderedCards.length; i++) {
      const card = orderedCards[i];
      let frontElements = [];
      let backElements = [];

      if (card.type === 'quiz') {
        // Create quiz element positioned in center of card
        const quizElement = createQuizElement(
          card.type === 'multiple-choice' ? 'multiple-choice' : 'true-false',
          card.question,
          card.options,
          card.correctAnswer,
          { x: 200, y: 150 }
        );
        
        frontElements.push(quizElement);
        
        // Add explanation as back element
        if (card.explanation) {
          backElements.push(createTextElement(
            `Explanation: ${card.explanation}`,
            { x: 150, y: 200 },
            { width: 500, height: 200 },
            14
          ));
        }
      } else if (card.type === 'informational') {
        // Create informational slide with title, content, and image
        
        // Title element
        if (card.title) {
          frontElements.push(createTextElement(
            card.title,
            { x: 100, y: 50 },
            { width: 600, height: 80 },
            24
          ));
        }
        
        // Content element
        if (card.content) {
          const contentY = card.imageUrl ? 300 : 200;
          frontElements.push(createTextElement(
            card.content,
            { x: 100, y: contentY },
            { width: 600, height: card.imageUrl ? 150 : 250 },
            16
          ));
        }
        
        // Image element
        if (card.imageUrl) {
          frontElements.push(createImageElement(
            card.imageUrl,
            { x: 200, y: 140 },
            { width: 400, height: 150 }
          ));
        }
      }

      // Insert flashcard
      const { data: flashcard, error } = await supabase
        .from('flashcards')
        .insert({
          set_id: setId,
          question: card.title || card.question || 'Generated Content',
          answer: card.type === 'quiz' ? `Quiz: ${card.question}` : card.content || '',
          front_elements: frontElements,
          back_elements: backElements,
          card_type: card.type === 'quiz' ? 'quiz-only' : 'informational',
          interactive_type: card.type === 'quiz' ? (card.type === 'multiple-choice' ? 'multiple-choice' : 'true-false') : null,
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
        informationalCards: createdCards.filter(c => c.card_type === 'informational').length
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
