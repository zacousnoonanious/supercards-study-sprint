
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_PROMPT_LENGTH = 1000;
const MAX_CARDS_COUNT = 25;

const validateInput = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.prompt || typeof data.prompt !== 'string') {
    errors.push('Prompt is required and must be a string');
  } else if (data.prompt.length > MAX_PROMPT_LENGTH) {
    errors.push(`Prompt must be ${MAX_PROMPT_LENGTH} characters or less`);
  } else if (data.prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty');
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

// Template mapping for AI selection
const getTemplateForContent = (contentType: string, templateMode: string, allowedTemplates: string[]) => {
  const templateMap: Record<string, string> = {
    'title': 'info-article',
    'overview': 'normal-basic',
    'detailed': 'info-study-guide',
    'comparison': 'normal-two-column',
    'timeline': 'info-timeline',
    'quiz-mc': 'normal-quiz',
    'quiz-tf': 'quiz-true-false',
    'definition': 'normal-vocab',
    'example': 'normal-image-text',
    'summary': 'info-article'
  };

  if (templateMode === 'auto') {
    return templateMap[contentType] || 'normal-basic';
  } else if (templateMode === 'mixed' && allowedTemplates.length > 0) {
    return allowedTemplates[Math.floor(Math.random() * allowedTemplates.length)];
  }
  
  return 'normal-basic';
};

const createElement = (type: string, content: string, position: any, size: any, additionalProps: any = {}) => {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    rotation: 0,
    zIndex: 1,
    content,
    fontSize: additionalProps.fontSize || 16,
    color: additionalProps.color || '#000000',
    fontWeight: additionalProps.fontWeight || 'normal',
    fontStyle: additionalProps.fontStyle || 'normal',
    textDecoration: additionalProps.textDecoration || 'none',
    textAlign: additionalProps.textAlign || 'left',
    ...additionalProps
  };
};

const createQuizElement = (type: 'multiple-choice' | 'true-false', question: string, options?: string[], correctAnswer?: number | boolean) => {
  const baseElement = createElement(
    type,
    question,
    { x: 50, y: 100 },
    { width: 700, height: type === 'multiple-choice' ? 350 : 250 },
    {
      showImmediateFeedback: true,
      autoAdvanceOnAnswer: false,
      textAlign: 'center',
      fontSize: 18
    }
  );

  if (type === 'multiple-choice' && options) {
    return {
      ...baseElement,
      multipleChoiceOptions: options,
      correctAnswer: correctAnswer as number,
    };
  } else if (type === 'true-false') {
    return {
      ...baseElement,
      correctAnswer: correctAnswer === true ? 0 : 1,
    };
  }

  return baseElement;
};

const fetchWikipediaImages = async (searchTerms: string, count: number = 3): Promise<string[]> => {
  try {
    console.log(`Fetching Wikipedia images for: ${searchTerms}`);
    
    const searches = searchTerms.split(',').map(term => term.trim()).slice(0, 3);
    const images: string[] = [];
    
    for (const term of searches) {
      const searchResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/search/title?q=${encodeURIComponent(term)}&limit=2`
      );
      
      if (!searchResponse.ok) continue;
      
      const searchData = await searchResponse.json();
      
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
              .slice(0, 1)
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
    const config = await req.json();
    console.log('Enhanced AI generation request:', config);

    const validation = validateInput({ prompt: config.prompt, cardCount: config.cardCount });
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

    const sanitizedPrompt = sanitizeContent(config.prompt);
    
    // Calculate distribution
    const quizCardCount = config.includeQuiz ? Math.ceil((config.cardCount * config.quizPercentage) / 100) : 0;
    const informationalCardCount = config.cardCount - quizCardCount;
    const imageCardCount = config.autoIncludeImages ? Math.ceil((config.cardCount * config.imagePercentage) / 100) : 0;

    console.log(`Generating ${informationalCardCount} info cards, ${quizCardCount} quiz cards, ${imageCardCount} with images`);

    // Enhanced content generation with advanced prompting
    let infoCards = [];
    if (informationalCardCount > 0) {
      const densityInstruction = {
        'key-points': 'Focus on essential key points only, bullet format',
        'detailed': 'Provide detailed explanations with examples',
        'comprehensive': 'Create comprehensive coverage with multiple perspectives'
      }[config.contentDensity];

      const audienceInstruction = {
        'beginner': 'Use simple language, define technical terms',
        'intermediate': 'Assume basic knowledge, moderate complexity',
        'advanced': 'Use technical language, advanced concepts',
        'mixed': 'Vary complexity levels throughout content'
      }[config.targetAudience];

      const infoPrompt = `Create ${informationalCardCount} educational slides about: ${sanitizedPrompt}

Content Requirements:
- Density: ${densityInstruction}
- Audience: ${audienceInstruction}
- Information Depth: ${config.informationDepth}% (scale from basic overview to expert level)
- Style: ${config.style}
${config.includeIntroOutro ? '- Include introduction and conclusion slides' : ''}
${config.includeSummary ? '- Include summary/recap content' : ''}
${config.includeDefinitions ? '- Auto-generate definitions for key terms' : ''}
${config.includeExamples ? '- Include relevant examples and case studies' : ''}
${config.generateRelatedTopics ? '- Include related topic connections' : ''}

Return ONLY a JSON array with this exact format:
[
  {
    "type": "title|content|definition|example|summary|comparison|timeline",
    "title": "Slide Title (max 50 chars)",
    "content": "Educational content (adapt length to density setting)",
    "imageQuery": "specific search term for relevant image",
    "layoutHint": "single-column|two-column|image-focus|text-heavy"
  }
]`;

      console.log('Generating enhanced informational content...');
      const infoResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: `You are an expert educational content creator. Create engaging, accurate educational materials. Always return valid JSON. Adapt content complexity to the specified audience and density requirements.` 
            },
            { role: 'user', content: infoPrompt }
          ],
          max_tokens: 3000,
          temperature: config.style === 'creative' ? 0.8 : 0.6,
        }),
      });

      if (infoResponse.ok) {
        const infoData = await infoResponse.json();
        const infoContent = infoData.choices[0]?.message?.content;
        
        if (infoContent) {
          try {
            const jsonMatch = infoContent.match(/\[[\s\S]*\]/);
            const cleanJson = jsonMatch ? jsonMatch[0] : infoContent;
            infoCards = JSON.parse(cleanJson);
            console.log(`Successfully parsed ${infoCards.length} info cards`);
          } catch (e) {
            console.error('Failed to parse informational cards:', e);
          }
        }
      }
    }

    // Enhanced quiz generation
    let quizCards = [];
    if (quizCardCount > 0) {
      const quizTypeDistribution = [];
      if (config.quizTypes?.multipleChoice) {
        const mcCount = Math.ceil(quizCardCount * (config.mcToTfRatio / 100));
        quizTypeDistribution.push(...Array(mcCount).fill('multiple-choice'));
      }
      if (config.quizTypes?.trueFalse) {
        const tfCount = quizCardCount - quizTypeDistribution.length;
        quizTypeDistribution.push(...Array(Math.max(0, tfCount)).fill('true-false'));
      }

      const difficultyInstruction = {
        'easy': 'Create straightforward questions with obvious answers',
        'medium': 'Create moderately challenging questions requiring understanding',
        'hard': 'Create complex questions requiring deep analysis',
        'mixed': 'Vary difficulty levels from easy to hard'
      }[config.quizDifficulty];

      const quizPrompt = `Create ${quizCardCount} quiz questions about: ${sanitizedPrompt}

Quiz Requirements:
- Question types: ${quizTypeDistribution.join(', ')}
- Difficulty: ${difficultyInstruction}
- Audience: ${config.targetAudience}
- Focus on testing understanding, not just memorization

Return ONLY a JSON array with this exact format:
[
  {
    "type": "multiple-choice",
    "question": "Clear, specific question?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation why this is correct",
    "difficulty": "easy|medium|hard"
  },
  {
    "type": "true-false",
    "question": "Clear statement to evaluate",
    "correctAnswer": true,
    "explanation": "Explanation of why true/false",
    "difficulty": "easy|medium|hard"
  }
]`;

      console.log('Generating enhanced quiz content...');
      const quizResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert quiz creator. Create challenging but fair questions that test understanding. Always return valid JSON.' 
            },
            { role: 'user', content: quizPrompt }
          ],
          max_tokens: 2500,
          temperature: 0.5,
        }),
      });

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        const quizContent = quizData.choices[0]?.message?.content;
        
        if (quizContent) {
          try {
            const jsonMatch = quizContent.match(/\[[\s\S]*\]/);
            const cleanJson = jsonMatch ? jsonMatch[0] : quizContent;
            quizCards = JSON.parse(cleanJson);
            console.log(`Successfully parsed ${quizCards.length} quiz cards`);
          } catch (e) {
            console.error('Failed to parse quiz cards:', e);
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

    // Fetch images if enabled
    let images: string[] = [];
    if (config.autoIncludeImages) {
      const searchTerms = config.imageSearchTerms || sanitizedPrompt;
      images = await fetchWikipediaImages(searchTerms, imageCardCount);
    }

    // Create enhanced flashcards with template selection
    const createdCards = [];
    let infoIndex = 0;
    let quizIndex = 0;
    let imageIndex = 0;
    let imagesUsed = 0;

    for (let i = 0; i < config.cardCount; i++) {
      let frontElements = [];
      let backElements = [];
      let cardType = 'informational';
      let interactiveType = null;
      let canvasWidth = 800;
      let canvasHeight = 600;

      // Determine content type and template
      let contentType = 'content';
      let template = config.selectedTemplate;

      // Smart card distribution using adaptive content flow
      if (config.adaptiveContent) {
        // Intro cards
        if (i === 0 && config.includeIntroOutro) {
          contentType = 'title';
        }
        // Quiz cards strategically placed
        else if (i > 0 && (i + 1) % 4 === 0 && quizIndex < quizCards.length) {
          contentType = 'quiz';
        }
        // Summary cards
        else if (i === config.cardCount - 1 && config.includeSummary) {
          contentType = 'summary';
        }
        // Regular content
        else if (infoIndex < infoCards.length) {
          const infoCard = infoCards[infoIndex];
          contentType = infoCard.type || 'content';
        }
      } else {
        // Simple alternating pattern
        if (i > 0 && (i + 1) % 3 === 0 && quizIndex < quizCards.length) {
          contentType = 'quiz';
        } else if (infoIndex < infoCards.length) {
          contentType = 'content';
        }
      }

      // Select appropriate template
      if (config.templateMode !== 'fixed') {
        template = getTemplateForContent(contentType, config.templateMode, config.allowedTemplates);
      }

      // Set canvas dimensions based on template or content type
      if (contentType === 'quiz') {
        canvasWidth = 600;
        canvasHeight = 900;
      } else if (config.contentDensity === 'comprehensive') {
        canvasWidth = 900;
        canvasHeight = 1200;
      } else {
        canvasWidth = 800;
        canvasHeight = 600;
      }

      if (contentType === 'quiz' && quizIndex < quizCards.length) {
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
          backElements.push(createElement(
            'text',
            `Explanation: ${quizCard.explanation}`,
            { x: 50, y: 200 },
            { width: canvasWidth - 100, height: 200 },
            { fontSize: 16, textAlign: 'center' }
          ));
        }
      } else if (infoIndex < infoCards.length) {
        // Info card
        const infoCard = infoCards[infoIndex++];
        cardType = config.contentDensity === 'comprehensive' ? 'informational' : 'normal';
        
        let currentY = 50;
        
        // Title element
        if (infoCard.title) {
          frontElements.push(createElement(
            'text',
            infoCard.title,
            { x: 50, y: currentY },
            { width: canvasWidth - 100, height: 80 },
            { fontSize: contentType === 'title' ? 28 : 24, fontWeight: 'bold', textAlign: 'center' }
          ));
          currentY += 100;
        }
        
        // Image element (if enabled and available)
        const shouldIncludeImage = config.autoIncludeImages && 
                                 images.length > 0 && 
                                 imageIndex < imageCardCount &&
                                 imagesUsed < images.length;
        
        if (shouldIncludeImage) {
          const imageUrl = images[imageIndex % images.length];
          frontElements.push(createElement(
            'image',
            '',
            { x: (canvasWidth - 400) / 2, y: currentY },
            { width: 400, height: 250 },
            { imageUrl }
          ));
          currentY += 270;
          imageIndex++;
          imagesUsed++;
        }
        
        // Content element with adaptive positioning
        if (infoCard.content) {
          const contentHeight = config.contentDensity === 'comprehensive' ? 300 : 
                               config.contentDensity === 'detailed' ? 200 : 150;
          
          frontElements.push(createElement(
            'text',
            infoCard.content,
            { x: 50, y: currentY },
            { width: canvasWidth - 100, height: contentHeight },
            { 
              fontSize: config.contentDensity === 'comprehensive' ? 14 : 16,
              textAlign: infoCard.layoutHint === 'image-focus' ? 'center' : 'left'
            }
          ));
        }
      }

      // Insert flashcard into database
      console.log(`Creating enhanced card ${i + 1} of type ${cardType} with template ${template}`);
      const { data: flashcard, error } = await supabase
        .from('flashcards')
        .insert({
          set_id: config.setId,
          question: contentType === 'quiz' ? 'Quiz Question' : 'Educational Content',
          answer: contentType === 'quiz' ? 'Quiz Answer' : 'Educational Information',
          front_elements: frontElements,
          back_elements: backElements,
          card_type: cardType,
          interactive_type: interactiveType,
          canvas_width: canvasWidth,
          canvas_height: canvasHeight,
          metadata: {
            template: template,
            contentType: contentType,
            aiGenerated: true,
            difficulty: quizIndex > 0 ? quizCards[quizIndex - 1]?.difficulty : undefined
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating flashcard:', error);
      } else {
        createdCards.push(flashcard);
        console.log(`Successfully created enhanced card ${flashcard.id}`);
      }
    }

    console.log(`Enhanced generation complete: ${createdCards.length} cards created with ${imagesUsed} images`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        cardCount: createdCards.length,
        quizCards: createdCards.filter(c => c.card_type === 'quiz-only').length,
        informationalCards: createdCards.filter(c => c.card_type !== 'quiz-only').length,
        imagesGenerated: imagesUsed,
        templateMode: config.templateMode,
        contentDensity: config.contentDensity
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhanced generate-flashcards function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
