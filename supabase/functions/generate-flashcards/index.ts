import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common words to avoid in fill-in-blank exercises
const COMMON_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'have', 'had', 'been', 'were', 'would',
  'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'do', 'does',
  'did', 'this', 'these', 'those', 'they', 'them', 'their', 'there', 'then',
  'when', 'where', 'who', 'what', 'why', 'how', 'but', 'or', 'so', 'if',
  'because', 'while', 'during', 'before', 'after', 'above', 'below', 'up',
  'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
]);

// Function to create visual elements for cards
function createCardElements(card: any, cardType: string) {
  const elements = {
    front_elements: [] as any[],
    back_elements: [] as any[]
  };

  switch (cardType) {
    case 'informational':
      // Single-sided informational card
      elements.front_elements = [
        {
          id: `title_${Date.now()}_1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 500,
          height: 80,
          content: card.question || card.title || 'Information Card',
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center'
        },
        {
          id: `content_${Date.now()}_2`,
          type: 'text',
          x: 50,
          y: 150,
          width: 500,
          height: 600,
          content: card.answer || card.explanation || card.content || '',
          fontSize: 16,
          color: '#374151',
          textAlign: 'left'
        }
      ];
      break;

    case 'multiple-choice':
      // Quiz card with multiple choice
      elements.front_elements = [
        {
          id: `question_${Date.now()}_1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 500,
          height: 120,
          content: card.question || '',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center'
        },
        {
          id: `mc_${Date.now()}_2`,
          type: 'multiple-choice',
          x: 50,
          y: 200,
          width: 500,
          height: 300,
          multipleChoiceOptions: card.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: 0,
          showImmediateFeedback: true
        }
      ];
      if (card.explanation) {
        elements.back_elements = [
          {
            id: `explanation_${Date.now()}_3`,
            type: 'text',
            x: 50,
            y: 50,
            width: 500,
            height: 400,
            content: `Correct! ${card.explanation}`,
            fontSize: 16,
            color: '#059669',
            textAlign: 'center'
          }
        ];
      }
      break;

    case 'true-false':
      // True/False quiz card
      elements.front_elements = [
        {
          id: `question_${Date.now()}_1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 500,
          height: 150,
          content: card.question || '',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center'
        },
        {
          id: `tf_${Date.now()}_2`,
          type: 'true-false',
          x: 150,
          y: 250,
          width: 300,
          height: 200,
          correctAnswer: card.correctAnswer || false,
          showImmediateFeedback: true
        }
      ];
      if (card.explanation) {
        elements.back_elements = [
          {
            id: `explanation_${Date.now()}_3`,
            type: 'text',
            x: 50,
            y: 50,
            width: 500,
            height: 400,
            content: card.explanation,
            fontSize: 16,
            color: '#374151',
            textAlign: 'center'
          }
        ];
      }
      break;

    case 'fill-in-blank':
      // Fill in the blank card
      elements.front_elements = [
        {
          id: `fib_${Date.now()}_1`,
          type: 'fill-in-blank',
          x: 50,
          y: 100,
          width: 500,
          height: 400,
          fillInBlankText: card.fillInBlankText || card.question || '',
          fillInBlankBlanks: card.blanks || [],
          showLetterCount: true,
          ignoreCase: true
        }
      ];
      break;

    default:
      // Standard Q&A card
      elements.front_elements = [
        {
          id: `question_${Date.now()}_1`,
          type: 'text',
          x: 50,
          y: 200,
          width: 500,
          height: 200,
          content: card.question || card.front || '',
          fontSize: 18,
          color: '#1f2937',
          textAlign: 'center',
          fontWeight: 'bold'
        }
      ];
      elements.back_elements = [
        {
          id: `answer_${Date.now()}_2`,
          type: 'text',
          x: 50,
          y: 200,
          width: 500,
          height: 200,
          content: card.answer || card.back || '',
          fontSize: 16,
          color: '#374151',
          textAlign: 'center'
        }
      ];
  }

  return elements;
}

// Function to identify important words for blanking
function getImportantWords(text: string, blankPercentage: number, avoidCommonWords: boolean): number[] {
  const words = text.split(/\s+/);
  const importantWordIndices: number[] = [];
  
  words.forEach((word, index) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    
    // Skip if it's a common word and we're avoiding them
    if (avoidCommonWords && COMMON_WORDS.has(cleanWord)) {
      return;
    }
    
    // Skip very short words unless they're significant
    if (cleanWord.length < 3 && !['AI', 'IT', 'ID', 'TV'].includes(cleanWord.toUpperCase())) {
      return;
    }
    
    // Prioritize nouns, verbs, adjectives, and proper nouns
    const isCapitalized = word[0] === word[0].toUpperCase();
    const isLikelyImportant = cleanWord.length >= 4 || isCapitalized;
    
    if (isLikelyImportant) {
      importantWordIndices.push(index);
    }
  });
  
  // Calculate how many words to blank based on percentage
  const targetBlanks = Math.ceil((importantWordIndices.length * blankPercentage) / 100);
  
  // Randomly select from important words
  const shuffled = importantWordIndices.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(targetBlanks, importantWordIndices.length));
}

// Function to clean and parse AI response
function cleanAndParseJSON(content: string): any {
  try {
    // First try to parse as-is
    return JSON.parse(content);
  } catch (error) {
    // If that fails, try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (innerError) {
        console.error('Failed to parse extracted JSON:', innerError);
        throw new Error('Invalid JSON in markdown code block');
      }
    }
    
    // If no code blocks found, try to find JSON-like content
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      try {
        const extractedJSON = content.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(extractedJSON);
      } catch (innerError) {
        console.error('Failed to parse extracted JSON array:', innerError);
        throw new Error('Could not extract valid JSON from response');
      }
    }
    
    throw new Error('No valid JSON found in AI response');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      prompt,
      style = 'standard',
      setId,
      userId,
      cardCount = 8,
      templateMode = 'auto',
      selectedTemplate,
      allowedTemplates = [],
      contentDensity = 'detailed',
      informationDepth = 70,
      includeIntroOutro = true,
      includeSummary = true,
      targetAudience = 'intermediate',
      includeQuiz = true,
      quizPercentage = 25,
      quizTypes = { multipleChoice: true, trueFalse: true, fillInBlank: true },
      mcToTfRatio = 60,
      quizDifficulty = 'mixed',
      fillInBlankSettings = {
        intelligentWordSelection: true,
        blankPercentage: 25,
        avoidCommonWords: true
      },
      autoIncludeImages = true,
      imageSearchTerms = '',
      imagePercentage = 40,
      preferredImageStyle = 'mixed',
      generateRelatedTopics = false,
      includeDefinitions = true,
      includeExamples = true,
      adaptiveContent = true,
      mode = 'add-to-set'
    } = await req.json();

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate card distribution
    const totalQuizCards = Math.ceil((cardCount * quizPercentage) / 100);
    const informationalCards = Math.ceil(cardCount * 0.3); // 30% informational
    const regularCards = cardCount - totalQuizCards - informationalCards;
    
    // Calculate quiz type distribution
    const enabledQuizTypes = Object.entries(quizTypes).filter(([_, enabled]) => enabled);
    const fillInBlankCards = quizTypes.fillInBlank ? Math.ceil(totalQuizCards / enabledQuizTypes.length) : 0;
    const multipleChoiceCards = quizTypes.multipleChoice ? Math.ceil((totalQuizCards - fillInBlankCards) * (mcToTfRatio / 100)) : 0;
    const trueFalseCards = totalQuizCards - fillInBlankCards - multipleChoiceCards;

    console.log(`Generating ${cardCount} cards: ${regularCards} Q&A, ${informationalCards} informational, ${multipleChoiceCards} MC, ${trueFalseCards} TF, ${fillInBlankCards} fill-in-blank`);

    // Enhanced system prompt with template instructions
    const systemPrompt = `You are an expert educational content creator specializing in comprehensive, engaging learning materials. Create ${cardCount} flashcards about "${prompt}" with the following specifications:

CONTENT REQUIREMENTS:
- Style: ${style}
- Density: ${contentDensity}
- Target Audience: ${targetAudience}
- Information Depth: ${informationDepth}%

CARD DISTRIBUTION AND TYPES:
- ${regularCards} standard Q&A cards (type: "standard")
- ${informationalCards} informational cards (type: "informational") - these should contain detailed explanations, definitions, or comprehensive overviews
- ${multipleChoiceCards} multiple choice questions (type: "multiple-choice")
- ${trueFalseCards} true/false questions (type: "true-false")
- ${fillInBlankCards} fill-in-blank exercises (type: "fill-in-blank")

CARD TYPE SPECIFICATIONS:

STANDARD CARDS:
- Simple question-answer format
- Clear, concise questions
- Detailed but focused answers

INFORMATIONAL CARDS:
- Comprehensive explanations of concepts
- Include definitions, examples, and context
- Perfect for background knowledge and detailed learning
- Use "title" and "content" fields instead of question/answer

MULTIPLE CHOICE:
- Clear question with 4 options
- First option should be correct
- Include brief explanation if helpful
- Use "question", "options" (array of 4), and "explanation" fields

TRUE/FALSE:
- Clear statement that can be definitively true or false
- Include explanation for the correct answer
- Use "question", "correctAnswer" (boolean), and "explanation" fields

FILL-IN-BLANK:
- Use "fillInBlankText" with complete sentences
- Mark important words/phrases that should be blanked with [BLANK] tags
- Focus on key terms, concepts, names, numbers
- Avoid blanking common words (a, the, is, etc.)

IMPORTANT: Return ONLY a valid JSON array of cards, no additional text, no markdown formatting, no code blocks.

Example format:
[
  {
    "type": "standard",
    "question": "What is photosynthesis?",
    "answer": "The process by which plants convert light energy into chemical energy."
  },
  {
    "type": "informational", 
    "title": "Photosynthesis Overview",
    "content": "Photosynthesis is a complex biological process... [detailed explanation]"
  },
  {
    "type": "multiple-choice",
    "question": "Which organelle is responsible for photosynthesis?",
    "options": ["Chloroplast", "Mitochondria", "Nucleus", "Ribosome"],
    "explanation": "Chloroplasts contain chlorophyll and are the sites of photosynthesis."
  },
  {
    "type": "true-false",
    "question": "Photosynthesis only occurs during the day.",
    "correctAnswer": true,
    "explanation": "Photosynthesis requires light energy, so it primarily occurs during daylight hours."
  },
  {
    "type": "fill-in-blank",
    "fillInBlankText": "During photosynthesis, plants use [BLANK] and [BLANK] to produce [BLANK] and oxygen.",
    "explanation": "Plants use carbon dioxide and water to produce glucose and oxygen."
  }
]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate ${cardCount} educational flashcards about: ${prompt}` }
        ],
        max_tokens: 4000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content from OpenAI');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    let cards;
    try {
      cards = cleanAndParseJSON(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', content);
      throw new Error(`Invalid JSON response from AI: ${parseError.message}`);
    }

    if (!Array.isArray(cards)) {
      throw new Error('AI response is not an array of cards');
    }

    // Process cards and insert them into the database
    const processedCards = await Promise.all(cards.map(async (card: any, index: number) => {
      // Determine card type and create visual elements
      let cardType = 'normal';
      let interactiveType = null;
      
      switch (card.type) {
        case 'informational':
          cardType = 'informational';
          break;
        case 'multiple-choice':
          cardType = 'quiz-only';
          interactiveType = 'multiple-choice';
          break;
        case 'true-false':
          cardType = 'quiz-only';
          interactiveType = 'true-false';
          break;
        case 'fill-in-blank':
          cardType = 'quiz-only';
          interactiveType = 'fill-in-blank';
          break;
        default:
          cardType = 'normal';
      }

      // Create visual elements based on card type
      const elements = createCardElements(card, card.type);

      let cardData: any = {
        set_id: setId,
        question: card.question || card.title || card.front || '',
        answer: card.answer || card.content || card.back || '',
        card_type: cardType,
        interactive_type: interactiveType,
        front_elements: elements.front_elements,
        back_elements: elements.back_elements,
        canvas_width: 600,
        canvas_height: 900
      };

      // Handle fill-in-blank specific processing
      if (card.type === 'fill-in-blank' && card.fillInBlankText) {
        // Process [BLANK] tags in the text
        const text = card.fillInBlankText;
        const blankRegex = /\[BLANK\]/g;
        const blanks = [];
        let match;
        let wordIndex = 0;
        const words = text.replace(/\[BLANK\]/g, '___').split(/\s+/);
        
        // Find positions of blanks
        words.forEach((word, index) => {
          if (word.includes('___')) {
            const originalWord = text.split(/\s+/)[index];
            if (originalWord && !originalWord.includes('[BLANK]')) {
              blanks.push({
                position: index,
                word: originalWord.replace(/[^\w]/g, ''),
                id: `blank_${index}_${Date.now()}`
              });
            }
          }
        });

        // Update the fill-in-blank element with proper blanks
        if (elements.front_elements[0]) {
          elements.front_elements[0].fillInBlankBlanks = blanks;
          elements.front_elements[0].fillInBlankText = text.replace(/\[BLANK\]/g, '___');
        }

        cardData.front_elements = elements.front_elements;
      }

      // Add explanation if provided
      if (card.explanation) {
        cardData.hint = card.explanation;
      }

      // Insert card into database
      const { data: insertedCard, error: cardError } = await supabase
        .from('flashcards')
        .insert(cardData)
        .select()
        .single();

      if (cardError) {
        console.error('Error inserting card:', cardError);
        throw cardError;
      }

      return insertedCard;
    }));

    console.log(`Successfully created ${processedCards.length} cards with visual elements`);

    return new Response(
      JSON.stringify({
        success: true,
        cardCount: processedCards.length,
        quizCards: multipleChoiceCards + trueFalseCards,
        fillInBlankCards,
        informationalCards,
        regularCards,
        imagesGenerated: 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-flashcards function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
