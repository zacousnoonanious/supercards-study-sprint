
import { CardTemplate } from '@/types/flashcard';

export const cardTemplates: CardTemplate[] = [
  {
    id: 'normal-card',
    name: 'Normal Card',
    description: 'A standard card with a front and back side.',
    category: 'study',
    front_elements: [
      {
        id: 'front-title',
        type: 'text',
        x: 20,
        y: 20,
        width: 560,
        height: 40,
        zIndex: 1,
        content: 'Front of Card',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        backgroundColor: 'transparent'
      },
      {
        id: 'front-content',
        type: 'text',
        x: 20,
        y: 80,
        width: 560,
        height: 280,
        zIndex: 1,
        content: 'Enter your question or prompt here...',
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        backgroundColor: 'transparent'
      }
    ],
    back_elements: [
      {
        id: 'back-title',
        type: 'text',
        x: 20,
        y: 20,
        width: 560,
        height: 40,
        zIndex: 1,
        content: 'Back of Card',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        backgroundColor: 'transparent'
      },
      {
        id: 'back-content',
        type: 'text',
        x: 20,
        y: 80,
        width: 560,
        height: 280,
        zIndex: 1,
        content: 'Enter the answer or explanation here...',
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        backgroundColor: 'transparent'
      }
    ],
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 400,
    allowedElementTypes: ['text', 'image', 'audio', 'drawing', 'youtube', 'tts'],
    autoAdvanceOnAnswer: false,
    showBackSide: true,
    restrictedToolbar: false,
    countdown_timer_front: 0,
    countdown_timer_back: 0
  },
  {
    id: 'simple-card',
    name: 'Simple Card',
    description: 'A card with only a front side for quick facts.',
    category: 'information',
    front_elements: [
      {
        id: 'front-title',
        type: 'text',
        x: 20,
        y: 20,
        width: 560,
        height: 60,
        zIndex: 1,
        content: 'Title of Fact',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        backgroundColor: 'transparent'
      },
      {
        id: 'front-content',
        type: 'text',
        x: 20,
        y: 100,
        width: 560,
        height: 260,
        zIndex: 1,
        content: 'Enter the fact or information here...',
        fontSize: 18,
        color: '#374151',
        textAlign: 'center',
        backgroundColor: 'transparent'
      }
    ],
    back_elements: [],
    card_type: 'simple',
    canvas_width: 600,
    canvas_height: 400,
    allowedElementTypes: ['text', 'image', 'audio', 'drawing', 'youtube', 'tts'],
    autoAdvanceOnAnswer: true,
    showBackSide: false,
    restrictedToolbar: false,
    countdown_timer_front: 0,
    countdown_timer_back: 0
  },
  {
    id: 'quiz-card',
    name: 'Quiz Card',
    description: 'A card designed for quizzes with a question and answer section.',
    category: 'quiz',
    front_elements: [
      {
        id: 'quiz-question',
        type: 'text',
        x: 20,
        y: 20,
        width: 560,
        height: 120,
        zIndex: 1,
        content: 'Enter your quiz question here...',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        backgroundColor: 'transparent'
      },
      {
        id: 'quiz-options',
        type: 'multiple-choice',
        x: 20,
        y: 160,
        width: 560,
        height: 200,
        zIndex: 1,
        multipleChoiceOptions: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 0,
        fontSize: 18,
        color: '#374151',
        backgroundColor: '#f0f9ff'
      }
    ],
    back_elements: [
      {
        id: 'back-title',
        type: 'text',
        x: 20,
        y: 20,
        width: 560,
        height: 40,
        zIndex: 1,
        content: 'Explanation',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        backgroundColor: 'transparent'
      },
      {
        id: 'back-explanation',
        type: 'text',
        x: 20,
        y: 80,
        width: 560,
        height: 280,
        zIndex: 1,
        content: 'Explanation of the correct answer goes here...',
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        backgroundColor: 'transparent'
      }
    ],
    card_type: 'quiz-only',
    canvas_width: 600,
    canvas_height: 400,
    allowedElementTypes: ['text', 'image', 'audio', 'drawing', 'youtube', 'multiple-choice', 'tts'],
    autoAdvanceOnAnswer: true,
    showBackSide: true,
    restrictedToolbar: false,
    countdown_timer_front: 0,
    countdown_timer_back: 0
  },
  {
    id: 'vocab-card',
    name: 'Vocabulary Card',
    description: 'A card for learning vocabulary with a word and its definition.',
    category: 'vocab',
    front_elements: [
      {
        id: 'vocab-word',
        type: 'text',
        x: 20,
        y: 20,
        width: 560,
        height: 80,
        zIndex: 1,
        content: 'Word',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        backgroundColor: 'transparent'
      },
      {
        id: 'vocab-example',
        type: 'text',
        x: 20,
        y: 120,
        width: 560,
        height: 100,
        zIndex: 1,
        content: 'Example sentence using the word...',
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        fontStyle: 'italic',
        backgroundColor: 'transparent'
      }
    ],
    back_elements: [
      {
        id: 'back-title',
        type: 'text',
        x: 20,
        y: 20,
        width: 560,
        height: 40,
        zIndex: 1,
        content: 'Definition',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        backgroundColor: 'transparent'
      },
      {
        id: 'back-definition',
        type: 'text',
        x: 20,
        y: 80,
        width: 560,
        height: 280,
        zIndex: 1,
        content: 'Definition of the word goes here...',
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        backgroundColor: 'transparent'
      }
    ],
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 400,
    allowedElementTypes: ['text', 'image', 'audio', 'drawing', 'youtube', 'tts'],
    autoAdvanceOnAnswer: false,
    showBackSide: true,
    restrictedToolbar: false,
    countdown_timer_front: 0,
    countdown_timer_back: 0
  },
  {
    id: 'custom-card',
    name: 'Custom Card',
    description: 'A blank card template for creating your own unique designs.',
    category: 'custom',
    front_elements: [],
    back_elements: [],
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 400,
    allowedElementTypes: ['text', 'image', 'audio', 'drawing', 'youtube', 'multiple-choice', 'tts', 'fill-in-blank'],
    autoAdvanceOnAnswer: false,
    showBackSide: true,
    restrictedToolbar: false,
    countdown_timer_front: 0,
    countdown_timer_back: 0
  },
  {
    id: 'fill-in-blank-study',
    name: 'Fill-in-the-Blank Study',
    description: 'Interactive template for vocabulary and comprehension exercises with customizable blanks',
    category: 'study',
    front_elements: [
      {
        id: 'fill-blank-instructions',
        type: 'text',
        x: 20,
        y: 20,
        width: 560,
        height: 40,
        zIndex: 1,
        content: 'Fill in the blanks below:',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'left',
        backgroundColor: 'transparent'
      },
      {
        id: 'fill-blank-exercise',
        type: 'fill-in-blank',
        x: 20,
        y: 80,
        width: 560,
        height: 280,
        zIndex: 1,
        fillInBlankText: 'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.',
        fillInBlankBlanks: [
          {
            id: 'blank_1',
            answer: 'quick',
            word: 'quick',
            position: 1
          },
          {
            id: 'blank_2', 
            answer: 'fox',
            word: 'fox',
            position: 3
          },
          {
            id: 'blank_3',
            answer: 'lazy',
            word: 'lazy',
            position: 8
          }
        ],
        ignoreCase: true,
        showLetterCount: false,
        fontSize: 16,
        color: '#374151',
        backgroundColor: '#f9fafb'
      }
    ],
    back_elements: [
      {
        id: 'back-title',
        type: 'text',
        x: 20,
        y: 20,
        width: 560,
        height: 40,
        zIndex: 1,
        content: 'Complete Sentence:',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'left'
      },
      {
        id: 'back-answer',
        type: 'text',
        x: 20,
        y: 80,
        width: 560,
        height: 120,
        zIndex: 1,
        content: 'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.',
        fontSize: 16,
        color: '#374151',
        backgroundColor: '#f0f9ff',
        textAlign: 'left'
      },
      {
        id: 'back-explanation',
        type: 'text',
        x: 20,
        y: 220,
        width: 560,
        height: 140,
        zIndex: 1,
        content: 'This is a pangram - a sentence that uses every letter of the alphabet at least once. It\'s commonly used for testing fonts and keyboards.',
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'left'
      }
    ],
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 400,
    allowedElementTypes: ['text', 'fill-in-blank'],
    autoAdvanceOnAnswer: false,
    showBackSide: true,
    restrictedToolbar: false,
    countdown_timer_front: 0,
    countdown_timer_back: 0
  }
];

export const getTemplateById = (id: string): CardTemplate | undefined => {
  return cardTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): CardTemplate[] => {
  return cardTemplates.filter(template => template.category === category);
};
