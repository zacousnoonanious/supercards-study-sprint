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
  } else if (data.prompt.length > 500) {
    errors.push('Prompt must be 500 characters or less');
  } else if (data.prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty');
  }

  if (!data.style || !['standard', 'concise', 'detailed', 'funny', 'creative'].includes(data.style)) {
    errors.push('Style must be one of: standard, concise, detailed, funny, creative');
  }

  if (data.cardCount && (typeof data.cardCount !== 'number' || data.cardCount < 1 || data.cardCount > 20)) {
    errors.push('Count must be a number between 1 and 20');
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

const createQuizElement = (type: 'multiple-choice' | 'true-false', question: string, options?: string[], correctAnswer?: number | boolean, explanation?: string) => {
  const baseElement = {
    id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    x: 50,
    y: 100,
    width: 700,
    height: type === 'multiple-choice' ? 350 : 250,
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
    console.log(`Fetching Wikipedia images for: ${topic}`);
    
    const searchResponse = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/search/title?q=${encodeURIComponent(topic)}&limit=3`
    );
    
    if (!searchResponse.ok) {
      console.log('Wikipedia search failed');
      return [];
    }
    
    const searchData = await searchResponse.json();
    const images: string[] = [];
    
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
              !item.title.toLowerCase().includes('edit-icon') &&
              !item.title.toLowerCase().includes('wikimedia')
            )
            .slice(0, 2)
            .map((item: any) => {
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
    
    console.log(`Found ${images.length} images`);
    return images.slice(0, count);
  } catch (error) {
    console.error('Error fetching Wikipedia images:', error);
    return [];
  }
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

    console.log('AI Flashcard generation request:', { prompt, cardCount, includeQuiz, quizPercentage });

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

    // Calculate content distribution
    const quizCardCount = includeQuiz ? Math.ceil((cardCount * quizPercentage) / 100) : 0;
    const informationalCardCount = cardCount - quizCardCount;

    console.log(`Generating ${informationalCardCount} info cards and ${quizCardCount} quiz cards`);

    // Generate informational content first
    let infoCards = [];
    if (informationalCardCount > 0) {
      const infoPrompt = `Create ${informationalCardCount} educational slides about: ${sanitizedPrompt}

Create slides in this order:
1. Title slide with main topic
2. Introduction slide explaining what the topic is about
3. Detailed content slides with specific information

Style: ${style}

Return ONLY a JSON array with this exact format:
[
  {
    "type": "title",
    "title": "Main Topic Title",
    "content": "Brief subtitle or description",
    "imageQuery": "search term for images"
  },
  {
    "type": "content", 
    "title": "Slide Title",
    "content": "Educational content (max 300 characters)",
    "imageQuery": "specific search term"
  }
]`;

      console.log('Generating informational content...');
      const infoResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an educational content creator. Return only valid JSON.' },
            { role: 'user', content: infoPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (infoResponse.ok) {
        const infoData = await infoResponse.json();
        const infoContent = infoData.choices[0]?.message?.content;
        
        if (infoContent) {
          try {
            // Clean the response to extract JSON
            const jsonMatch = infoContent.match(/\[[\s\S]*\]/);
            const cleanJson = jsonMatch ? jsonMatch[0] : infoContent;
            infoCards = JSON.parse(cleanJson);
            console.log(`Successfully parsed ${infoCards.length} info cards`);
          } catch (e) {
            console.error('Failed to parse informational cards:', e);
            console.log('Raw content:', infoContent);
          }
        }
      }
    }

    // Generate quiz content
    let quizCards = [];
    if (quizCardCount > 0) {
      const enabledTypes = [];
      if (quizTypes.multipleChoice) enabledTypes.push('multiple choice');
      if (quizTypes.trueFalse) enabledTypes.push('true/false');
      
      const quizPrompt = `Create ${quizCardCount} quiz questions about: ${sanitizedPrompt}

Use these question types: ${enabledTypes.join(' and ')}.

Return ONLY a JSON array with this exact format:
[
  {
    "type": "multiple-choice",
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct"
  },
  {
    "type": "true-false",
    "question": "Statement to evaluate",
    "correctAnswer": true,
    "explanation": "Explanation of the answer"
  }
]`;

      console.log('Generating quiz content...');
      const quizResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a quiz creator. Return only valid JSON.' },
            { role: 'user', content: quizPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        const quizContent = quizData.choices[0]?.message?.content;
        
        if (quizContent) {
          try {
            // Clean the response to extract JSON
            const jsonMatch = quizContent.match(/\[[\s\S]*\]/);
            const cleanJson = jsonMatch ? jsonMatch[0] : quizContent;
            quizCards = JSON.parse(cleanJson);
            console.log(`Successfully parsed ${quizCards.length} quiz cards`);
          } catch (e) {
            console.error('Failed to parse quiz cards:', e);
            console.log('Raw content:', quizContent);
          }
        }
      }
    }

    if (infoCards.length === 0 && quizCards.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No cards generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch images for informational content
    const images = await fetchWikipediaImages(sanitizedPrompt, Math.max(3, infoCards.length));

    // Create flashcards in database with mixed content
    const createdCards = [];
    let infoIndex = 0;
    let quizIndex = 0;

    for (let i = 0; i < cardCount; i++) {
      let frontElements = [];
      let backElements = [];
      let cardType = 'informational';
      let interactiveType = null;

      // Alternate pattern: 2 info cards, then 1 quiz card
      if (i > 0 && (i + 1) % 3 === 0 && quizIndex < quizCards.length) {
        // Quiz card
        const quizCard = quizCards[quizIndex++];
        cardType = 'quiz-only';
        
        if (quizCard.type === 'multiple-choice') {
          interactiveType = 'multiple-choice';
          const quizElement = createQuizElement(
            'multiple-choice',
            quizCard.question,
            quizCard.options,
            quizCard.correctAnswer
          );
          frontElements.push(quizElement);
        } else if (quizCard.type === 'true-false') {
          interactiveType = 'true-false';
          const quizElement = createQuizElement(
            'true-false',
            quizCard.question,
            undefined,
            quizCard.correctAnswer
          );
          frontElements.push(quizElement);
        }

        // Add explanation to back
        if (quizCard.explanation) {
          backElements.push(createTextElement(
            `Explanation: ${quizCard.explanation}`,
            { x: 50, y: 200 },
            { width: 700, height: 200 },
            16
          ));
        }
      } else if (infoIndex < infoCards.length) {
        // Info card
        const infoCard = infoCards[infoIndex++];
        
        // Title element
        if (infoCard.title) {
          frontElements.push(createTextElement(
            infoCard.title,
            { x: 50, y: 50 },
            { width: 700, height: 80 },
            24
          ));
        }
        
        // Content element
        if (infoCard.content) {
          const contentY = images.length > 0 ? 350 : 200;
          frontElements.push(createTextElement(
            infoCard.content,
            { x: 50, y: contentY },
            { width: 700, height: 150 },
            16
          ));
        }
        
        // Image element
        if (images.length > 0 && infoIndex <= images.length) {
          const imageUrl = images[(infoIndex - 1) % images.length];
          if (imageUrl) {
            frontElements.push(createImageElement(
              imageUrl,
              { x: 150, y: 150 },
              { width: 500, height: 180 }
            ));
          }
        }
      }

      // Insert flashcard into database
      console.log(`Creating card ${i + 1} of type ${cardType}`);
      const { data: flashcard, error } = await supabase
        .from('flashcards')
        .insert({
          set_id: setId,
          question: frontElements.length > 0 ? 'AI Generated Content' : 'Generated Content',
          answer: cardType === 'quiz-only' ? 'Quiz Card' : 'Educational Content',
          front_elements: frontElements,
          back_elements: backElements,
          card_type: cardType,
          interactive_type: interactiveType,
          canvas_width: 800,
          canvas_height: 533,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating flashcard:', error);
      } else {
        createdCards.push(flashcard);
        console.log(`Successfully created card ${flashcard.id}`);
      }
    }

    console.log(`Generation complete: ${createdCards.length} cards created`);

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
