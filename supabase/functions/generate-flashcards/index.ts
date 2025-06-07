
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
    const informationalCards = cardCount - totalQuizCards;
    
    // Calculate quiz type distribution
    const enabledQuizTypes = Object.entries(quizTypes).filter(([_, enabled]) => enabled);
    const fillInBlankCards = quizTypes.fillInBlank ? Math.ceil(totalQuizCards / enabledQuizTypes.length) : 0;
    const multipleChoiceCards = quizTypes.multipleChoice ? Math.ceil((totalQuizCards - fillInBlankCards) * (mcToTfRatio / 100)) : 0;
    const trueFalseCards = totalQuizCards - fillInBlankCards - multipleChoiceCards;

    console.log(`Generating ${cardCount} cards: ${informationalCards} informational, ${multipleChoiceCards} MC, ${trueFalseCards} TF, ${fillInBlankCards} fill-in-blank`);

    // Enhanced system prompt for comprehensive educational content
    const systemPrompt = `You are an expert educational content creator specializing in comprehensive, engaging learning materials. Create ${cardCount} flashcards about "${prompt}" with the following specifications:

CONTENT REQUIREMENTS:
- Style: ${style}
- Density: ${contentDensity}
- Target Audience: ${targetAudience}
- Information Depth: ${informationDepth}%

CARD DISTRIBUTION:
- ${informationalCards} informational cards
- ${multipleChoiceCards} multiple choice questions
- ${trueFalseCards} true/false questions
- ${fillInBlankCards} fill-in-blank exercises

FILL-IN-BLANK SPECIFICATIONS:
- Use intelligent word selection: ${fillInBlankSettings.intelligentWordSelection}
- Avoid common words (a, the, is, etc.): ${fillInBlankSettings.avoidCommonWords}
- Target ${fillInBlankSettings.blankPercentage}% of important words per sentence
- Focus on key terms, concepts, names, numbers, and significant descriptors
- Avoid blanking articles, prepositions, conjunctions, and auxiliary verbs

Format each card as a JSON object with these properties:
- type: "informational", "multiple-choice", "true-false", or "fill-in-blank"
- question: The main question or topic
- answer: For informational cards, the detailed explanation
- options: For multiple choice, array of 4 options with correct answer first
- correctAnswer: For true-false, boolean value
- fillInBlankText: For fill-in-blank, the complete text with important words to be blanked
- explanation: Additional context or explanation

QUALITY GUIDELINES:
- Make content educational and engaging
- Use clear, age-appropriate language for ${targetAudience} level
- Include specific examples and practical applications
- Ensure factual accuracy
- Create meaningful fill-in-blank exercises that test comprehension of key concepts

IMPORTANT: Return ONLY a valid JSON array of cards, no additional text, no markdown formatting, no code blocks.`;

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
      // Use the new cleaning and parsing function
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
      let cardData: any = {
        set_id: setId,
        question: card.question || card.front || '',
        answer: card.answer || card.back || '',
        user_id: userId,
        card_type: 'normal',
        interactive_type: null
      };

      // Handle different card types
      if (card.type === 'fill-in-blank') {
        cardData.interactive_type = 'fill-in-blank';
        cardData.question = card.fillInBlankText || card.question;
        cardData.answer = JSON.stringify({
          originalText: card.fillInBlankText,
          blanks: getImportantWords(
            card.fillInBlankText || card.question, 
            fillInBlankSettings.blankPercentage, 
            fillInBlankSettings.avoidCommonWords
          ).map(index => ({
            position: index,
            word: (card.fillInBlankText || card.question).split(/\s+/)[index]?.replace(/[^\w]/g, '') || ''
          }))
        });
      } else if (card.type === 'multiple-choice') {
        cardData.interactive_type = 'multiple-choice';
        cardData.answer = JSON.stringify({
          options: card.options || [],
          correctAnswer: 0
        });
      } else if (card.type === 'true-false') {
        cardData.interactive_type = 'true-false';
        cardData.answer = JSON.stringify({
          correctAnswer: card.correctAnswer || false
        });
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

    console.log(`Successfully created ${processedCards.length} cards`);

    return new Response(
      JSON.stringify({
        success: true,
        cardCount: processedCards.length,
        quizCards: multipleChoiceCards + trueFalseCards,
        fillInBlankCards,
        informationalCards,
        imagesGenerated: 0 // Will be implemented in future updates
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
