
import { CardTemplate } from '@/types/flashcard';

export const cardTemplates: CardTemplate[] = [
  // Normal Card Templates
  {
    id: 'normal-basic',
    name: 'Basic Question/Answer',
    description: 'Simple question on front, answer on back',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'front-question',
        type: 'text',
        x: 50,
        y: 400,
        width: 500,
        height: 100,
        content: 'Your question here',
        fontSize: 24,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center'
      }
    ],
    back_elements: [
      {
        id: 'back-answer',
        type: 'text',
        x: 50,
        y: 400,
        width: 500,
        height: 100,
        content: 'Your answer here',
        fontSize: 20,
        color: '#000000',
        textAlign: 'center'
      }
    ]
  },
  {
    id: 'normal-quiz',
    name: 'Multiple Choice Quiz',
    description: 'Question with multiple choice options',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'front-quiz',
        type: 'multiple-choice',
        x: 50,
        y: 200,
        width: 500,
        height: 400,
        content: 'What is the capital of France?',
        multipleChoiceOptions: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        showImmediateFeedback: true
      }
    ],
    back_elements: [
      {
        id: 'back-explanation',
        type: 'text',
        x: 50,
        y: 400,
        width: 500,
        height: 100,
        content: 'Paris is the capital and largest city of France.',
        fontSize: 18,
        color: '#000000',
        textAlign: 'center'
      }
    ]
  },
  
  // Simple Card Templates
  {
    id: 'simple-basic',
    name: 'Simple Flashcard',
    description: 'Basic front/back flashcard',
    card_type: 'simple',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'front-text',
        type: 'text',
        x: 0,
        y: 0,
        width: 600,
        height: 900,
        content: 'Front side text',
        fontSize: 24,
        color: '#000000',
        textAlign: 'center'
      }
    ],
    back_elements: [
      {
        id: 'back-text',
        type: 'text',
        x: 0,
        y: 0,
        width: 600,
        height: 900,
        content: 'Back side text',
        fontSize: 24,
        color: '#000000',
        textAlign: 'center'
      }
    ]
  },
  
  // Informational Card Templates
  {
    id: 'info-article',
    name: 'Information Article',
    description: 'Long-form informational content',
    card_type: 'informational',
    canvas_width: 900,
    canvas_height: 1800,
    front_elements: [
      {
        id: 'title',
        type: 'text',
        x: 50,
        y: 50,
        width: 800,
        height: 100,
        content: 'Article Title',
        fontSize: 32,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      {
        id: 'content',
        type: 'text',
        x: 50,
        y: 200,
        width: 800,
        height: 1200,
        content: 'Your detailed information content goes here. This can be a long article, explanation, or any informational text.',
        fontSize: 18,
        color: '#000000',
        textAlign: 'left'
      },
      {
        id: 'summary',
        type: 'text',
        x: 50,
        y: 1500,
        width: 800,
        height: 200,
        content: 'Key takeaways or summary points',
        fontSize: 16,
        color: '#666666',
        textAlign: 'left'
      }
    ],
    back_elements: []
  },
  {
    id: 'info-study-guide',
    name: 'Study Guide',
    description: 'Structured study material with sections',
    card_type: 'informational',
    canvas_width: 900,
    canvas_height: 1800,
    front_elements: [
      {
        id: 'guide-title',
        type: 'text',
        x: 50,
        y: 50,
        width: 800,
        height: 80,
        content: 'Study Guide Topic',
        fontSize: 28,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      {
        id: 'section1',
        type: 'text',
        x: 50,
        y: 180,
        width: 800,
        height: 300,
        content: 'Section 1: Key Concepts\n• Point 1\n• Point 2\n• Point 3',
        fontSize: 18,
        color: '#000000',
        textAlign: 'left'
      },
      {
        id: 'section2',
        type: 'text',
        x: 50,
        y: 530,
        width: 800,
        height: 300,
        content: 'Section 2: Examples\n• Example 1\n• Example 2\n• Example 3',
        fontSize: 18,
        color: '#000000',
        textAlign: 'left'
      },
      {
        id: 'quiz-section',
        type: 'multiple-choice',
        x: 50,
        y: 880,
        width: 800,
        height: 400,
        content: 'Quick Check: Which of the following is correct?',
        multipleChoiceOptions: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        showImmediateFeedback: true
      }
    ],
    back_elements: []
  }
];
