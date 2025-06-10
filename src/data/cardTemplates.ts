
import { CardTemplate } from '@/types/flashcard';

export const cardTemplates: CardTemplate[] = [
  // STUDY CARDS CATEGORY
  {
    id: 'simple-vocab',
    name: 'Simple Vocab Card',
    description: 'Basic vocabulary card with large text covering full width and height',
    category: 'vocab',
    image: '/placeholder.svg',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 400,
    allowedElementTypes: ['text', 'image', 'audio', 'tts'],
    autoAdvanceOnAnswer: false,
    showBackSide: true,
    restrictedToolbar: false,
    showGrid: false,
    snapToGrid: true,
    showBorder: false,
    front_elements: [
      {
        id: 'front-text',
        type: 'text',
        x: 20,
        y: 20,
        width: 560,
        height: 360,
        content: 'Word',
        fontSize: 48,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        rotation: 0,
        zIndex: 1,
      }
    ],
    back_elements: [
      {
        id: 'back-text',
        type: 'text',
        x: 20,
        y: 20,
        width: 560,
        height: 360,
        content: 'Definition',
        fontSize: 24,
        color: '#000000',
        textAlign: 'center',
        rotation: 0,
        zIndex: 1,
      }
    ]
  },
  
  {
    id: 'image-vocab',
    name: 'Image Vocabulary',
    description: 'Vocabulary card with image and text',
    category: 'vocab',
    image: '/placeholder.svg',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 800,
    allowedElementTypes: ['text', 'image', 'audio', 'tts'],
    autoAdvanceOnAnswer: false,
    showBackSide: true,
    restrictedToolbar: false,
    front_elements: [
      {
        id: 'front-image',
        type: 'image',
        x: 50,
        y: 50,
        width: 500,
        height: 400,
        imageUrl: '/placeholder.svg',
        rotation: 0,
        zIndex: 1,
      },
      {
        id: 'front-text',
        type: 'text',
        x: 50,
        y: 500,
        width: 500,
        height: 200,
        content: 'What is this?',
        fontSize: 32,
        color: '#000000',
        textAlign: 'center',
        rotation: 0,
        zIndex: 1,
      }
    ],
    back_elements: [
      {
        id: 'back-text',
        type: 'text',
        x: 50,
        y: 300,
        width: 500,
        height: 200,
        content: 'Answer',
        fontSize: 36,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        rotation: 0,
        zIndex: 1,
      }
    ]
  },

  // QUIZ CARDS CATEGORY
  {
    id: 'simple-quiz',
    name: 'Simple Quiz',
    description: 'Multiple choice question - auto-advances after answer',
    category: 'quiz',
    image: '/placeholder.svg',
    card_type: 'quiz-only',
    canvas_width: 700,
    canvas_height: 500,
    allowedElementTypes: ['multiple-choice', 'true-false'],
    autoAdvanceOnAnswer: true,
    showBackSide: false,
    restrictedToolbar: true,
    front_elements: [
      {
        id: 'quiz',
        type: 'multiple-choice',
        x: 50,
        y: 50,
        width: 600,
        height: 400,
        content: 'What is the capital of France?',
        multipleChoiceOptions: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        showImmediateFeedback: true,
        autoAdvanceOnAnswer: true,
        fontSize: 24,
        rotation: 0,
        zIndex: 1,
      }
    ],
    back_elements: []
  },

  {
    id: 'true-false-quiz',
    name: 'True/False Quiz',
    description: 'Simple true or false question',
    category: 'quiz',
    image: '/placeholder.svg',
    card_type: 'quiz-only',
    canvas_width: 700,
    canvas_height: 400,
    allowedElementTypes: ['true-false'],
    autoAdvanceOnAnswer: true,
    showBackSide: false,
    restrictedToolbar: true,
    front_elements: [
      {
        id: 'tf-quiz',
        type: 'true-false',
        x: 50,
        y: 50,
        width: 600,
        height: 300,
        content: 'The Earth is flat.',
        correctAnswer: 0,
        showImmediateFeedback: true,
        autoAdvanceOnAnswer: true,
        fontSize: 28,
        rotation: 0,
        zIndex: 1,
      }
    ],
    back_elements: []
  },

  // INFORMATION CARDS CATEGORY
  {
    id: 'info-panel',
    name: 'Information Panel',
    description: 'Large single-sided card for detailed information',
    category: 'information',
    image: '/placeholder.svg',
    card_type: 'informational',
    canvas_width: 900,
    canvas_height: 1200,
    allowedElementTypes: ['text', 'image'],
    autoAdvanceOnAnswer: false,
    showBackSide: false,
    restrictedToolbar: false,
    front_elements: [
      {
        id: 'title',
        type: 'text',
        x: 50,
        y: 50,
        width: 800,
        height: 100,
        content: 'Information Title',
        fontSize: 48,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        rotation: 0,
        zIndex: 1,
      },
      {
        id: 'content',
        type: 'text',
        x: 50,
        y: 200,
        width: 800,
        height: 800,
        content: 'Detailed information goes here. This template is perfect for comprehensive explanations, definitions, or reference material.',
        fontSize: 18,
        color: '#000000',
        textAlign: 'left',
        rotation: 0,
        zIndex: 1,
      }
    ],
    back_elements: []
  },

  // STUDY CARDS CATEGORY
  {
    id: 'blank-study',
    name: 'Blank Study Card',
    description: 'Empty card ready for customization',
    category: 'study',
    image: '/placeholder.svg',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 400,
    allowedElementTypes: ['text', 'image', 'audio', 'drawing', 'youtube', 'tts'],
    autoAdvanceOnAnswer: false,
    showBackSide: true,
    restrictedToolbar: false,
    front_elements: [],
    back_elements: []
  },

  {
    id: 'detailed-study',
    name: 'Detailed Study Card',
    description: 'Large format study card with title and content areas',
    category: 'study',
    image: '/placeholder.svg',
    card_type: 'normal',
    canvas_width: 800,
    canvas_height: 1000,
    allowedElementTypes: ['text', 'image', 'audio', 'drawing', 'youtube', 'tts'],
    autoAdvanceOnAnswer: false,
    showBackSide: true,
    restrictedToolbar: false,
    front_elements: [
      {
        id: 'front-title',
        type: 'text',
        x: 50,
        y: 50,
        width: 700,
        height: 80,
        content: 'Question or Topic',
        fontSize: 32,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        rotation: 0,
        zIndex: 1,
      },
      {
        id: 'front-content',
        type: 'text',
        x: 50,
        y: 150,
        width: 700,
        height: 700,
        content: 'Additional context or details...',
        fontSize: 18,
        color: '#000000',
        textAlign: 'left',
        rotation: 0,
        zIndex: 1,
      }
    ],
    back_elements: [
      {
        id: 'back-title',
        type: 'text',
        x: 50,
        y: 50,
        width: 700,
        height: 80,
        content: 'Answer',
        fontSize: 32,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        rotation: 0,
        zIndex: 1,
      },
      {
        id: 'back-content',
        type: 'text',
        x: 50,
        y: 150,
        width: 700,
        height: 700,
        content: 'Detailed explanation...',
        fontSize: 18,
        color: '#000000',
        textAlign: 'left',
        rotation: 0,
        zIndex: 1,
      }
    ]
  }
];

export const getTemplatesByCategory = () => {
  return cardTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, CardTemplate[]>);
};

export const getTemplateById = (id: string): CardTemplate | undefined => {
  return cardTemplates.find(template => template.id === id);
};
