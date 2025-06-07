
import { CardTemplate } from '@/types/flashcard';

export const cardTemplates: CardTemplate[] = [
  // Basic Normal Card Templates
  {
    id: 'normal-basic',
    name: 'Basic Question/Answer',
    description: 'Layout: Large question text centered on front, answer text centered on back. Perfect for simple Q&A flashcards.',
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
    id: 'normal-vocab',
    name: 'Vocabulary Card',
    description: 'Layout: Large word at top, definition below on front. Example sentence on back with word highlighted.',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'word',
        type: 'text',
        x: 50,
        y: 200,
        width: 500,
        height: 80,
        content: 'Vocabulary Word',
        fontSize: 28,
        color: '#2563eb',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      {
        id: 'definition',
        type: 'text',
        x: 50,
        y: 350,
        width: 500,
        height: 200,
        content: 'Definition of the word goes here',
        fontSize: 18,
        color: '#000000',
        textAlign: 'center'
      }
    ],
    back_elements: [
      {
        id: 'example',
        type: 'text',
        x: 50,
        y: 300,
        width: 500,
        height: 150,
        content: 'Example sentence using the word in context.',
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        fontStyle: 'italic'
      }
    ]
  },
  {
    id: 'normal-math',
    name: 'Math Problem',
    description: 'Layout: Problem statement at top, formula/equation in center on front. Step-by-step solution on back.',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'problem',
        type: 'text',
        x: 50,
        y: 150,
        width: 500,
        height: 100,
        content: 'Problem Statement',
        fontSize: 20,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      {
        id: 'equation',
        type: 'text',
        x: 50,
        y: 350,
        width: 500,
        height: 120,
        content: 'Mathematical Equation',
        fontSize: 24,
        color: '#dc2626',
        fontFamily: 'Courier New, monospace',
        textAlign: 'center'
      }
    ],
    back_elements: [
      {
        id: 'solution',
        type: 'text',
        x: 50,
        y: 200,
        width: 500,
        height: 400,
        content: 'Step 1: First step\nStep 2: Second step\nStep 3: Final answer',
        fontSize: 16,
        color: '#000000',
        textAlign: 'left'
      }
    ]
  },
  {
    id: 'normal-quiz',
    name: 'Multiple Choice Quiz',
    description: 'Layout: Question text at top, multiple choice options below with immediate feedback. Explanation on back.',
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
  {
    id: 'normal-image-text',
    name: 'Image with Text',
    description: 'Layout: Large image at top, descriptive text below on front. Additional details or question on back.',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'main-image',
        type: 'image',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        imageUrl: 'https://via.placeholder.com/400x300?text=Image+Here'
      },
      {
        id: 'description',
        type: 'text',
        x: 50,
        y: 450,
        width: 500,
        height: 150,
        content: 'Description or question about the image',
        fontSize: 18,
        color: '#000000',
        textAlign: 'center'
      }
    ],
    back_elements: [
      {
        id: 'details',
        type: 'text',
        x: 50,
        y: 350,
        width: 500,
        height: 200,
        content: 'Additional details, facts, or explanation',
        fontSize: 16,
        color: '#000000',
        textAlign: 'center'
      }
    ]
  },
  {
    id: 'normal-two-column',
    name: 'Two Column Layout',
    description: 'Layout: Two text blocks side by side on front (compare/contrast). Summary or conclusion on back.',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'title',
        type: 'text',
        x: 50,
        y: 100,
        width: 500,
        height: 60,
        content: 'Compare and Contrast',
        fontSize: 22,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      {
        id: 'left-column',
        type: 'text',
        x: 50,
        y: 200,
        width: 220,
        height: 300,
        content: 'Option A:\n• Point 1\n• Point 2\n• Point 3',
        fontSize: 16,
        color: '#2563eb',
        textAlign: 'left'
      },
      {
        id: 'right-column',
        type: 'text',
        x: 330,
        y: 200,
        width: 220,
        height: 300,
        content: 'Option B:\n• Point 1\n• Point 2\n• Point 3',
        fontSize: 16,
        color: '#dc2626',
        textAlign: 'left'
      }
    ],
    back_elements: [
      {
        id: 'conclusion',
        type: 'text',
        x: 50,
        y: 350,
        width: 500,
        height: 200,
        content: 'Key differences and conclusion',
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
    description: 'Layout: Full-screen text on both sides. Minimal design for quick review.',
    card_type: 'simple',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'front-text',
        type: 'text',
        x: 50,
        y: 350,
        width: 500,
        height: 200,
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
        x: 50,
        y: 350,
        width: 500,
        height: 200,
        content: 'Back side text',
        fontSize: 24,
        color: '#000000',
        textAlign: 'center'
      }
    ]
  },
  {
    id: 'simple-language',
    name: 'Language Learning',
    description: 'Layout: Large word/phrase in target language on front, translation on back.',
    card_type: 'simple',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'foreign-word',
        type: 'text',
        x: 50,
        y: 350,
        width: 500,
        height: 200,
        content: 'Foreign Language Word',
        fontSize: 28,
        color: '#2563eb',
        fontWeight: 'bold',
        textAlign: 'center'
      }
    ],
    back_elements: [
      {
        id: 'translation',
        type: 'text',
        x: 50,
        y: 350,
        width: 500,
        height: 200,
        content: 'English Translation',
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
    description: 'Layout: Title at top, main content in center, key takeaways at bottom. Single-sided comprehensive info.',
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
    description: 'Layout: Title, 2 content sections with bullet points, quiz section at bottom for self-assessment.',
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
  },
  {
    id: 'info-timeline',
    name: 'Timeline/Process',
    description: 'Layout: Title, chronological steps or process stages with dates/stages clearly marked.',
    card_type: 'informational',
    canvas_width: 900,
    canvas_height: 1800,
    front_elements: [
      {
        id: 'timeline-title',
        type: 'text',
        x: 50,
        y: 50,
        width: 800,
        height: 80,
        content: 'Timeline or Process Title',
        fontSize: 28,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      {
        id: 'step1',
        type: 'text',
        x: 50,
        y: 200,
        width: 800,
        height: 150,
        content: 'Step 1 (Date/Time): Description of first step or event',
        fontSize: 18,
        color: '#2563eb',
        textAlign: 'left'
      },
      {
        id: 'step2',
        type: 'text',
        x: 50,
        y: 400,
        width: 800,
        height: 150,
        content: 'Step 2 (Date/Time): Description of second step or event',
        fontSize: 18,
        color: '#2563eb',
        textAlign: 'left'
      },
      {
        id: 'step3',
        type: 'text',
        x: 50,
        y: 600,
        width: 800,
        height: 150,
        content: 'Step 3 (Date/Time): Description of third step or event',
        fontSize: 18,
        color: '#2563eb',
        textAlign: 'left'
      },
      {
        id: 'conclusion',
        type: 'text',
        x: 50,
        y: 800,
        width: 800,
        height: 150,
        content: 'Final outcome or conclusion',
        fontSize: 18,
        color: '#000000',
        textAlign: 'left'
      }
    ],
    back_elements: []
  },

  // Interactive Quiz Templates
  {
    id: 'quiz-true-false',
    name: 'True/False Quiz',
    description: 'Layout: Statement at top, true/false buttons below. Explanation appears after selection.',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'statement',
        type: 'text',
        x: 50,
        y: 200,
        width: 500,
        height: 150,
        content: 'Statement to evaluate as true or false',
        fontSize: 20,
        color: '#000000',
        textAlign: 'center'
      },
      {
        id: 'true-false-quiz',
        type: 'true-false',
        x: 150,
        y: 450,
        width: 300,
        height: 200,
        content: '',
        correctAnswer: 1,
        showImmediateFeedback: true
      }
    ],
    back_elements: [
      {
        id: 'explanation',
        type: 'text',
        x: 50,
        y: 350,
        width: 500,
        height: 200,
        content: 'Explanation of why the statement is true or false',
        fontSize: 16,
        color: '#000000',
        textAlign: 'center'
      }
    ]
  },
  {
    id: 'quiz-fill-blank',
    name: 'Fill in the Blank',
    description: 'Layout: Sentence with blank spaces to fill, hint text below, show letter count option.',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'fill-blank-quiz',
        type: 'fill-in-blank',
        x: 50,
        y: 300,
        width: 500,
        height: 300,
        content: 'The ___ is the capital of France.',
        fillInBlankText: 'The ___ is the capital of France.',
        fillInBlankBlanks: [
          {
            word: 'Paris',
            position: 4,
            id: 'blank-1'
          }
        ],
        showLetterCount: true,
        ignoreCase: true
      }
    ],
    back_elements: [
      {
        id: 'answer-explanation',
        type: 'text',
        x: 50,
        y: 400,
        width: 500,
        height: 100,
        content: 'Complete sentence with explanation',
        fontSize: 16,
        color: '#000000',
        textAlign: 'center'
      }
    ]
  },

  // Advanced Layout Templates
  {
    id: 'advanced-diagram',
    name: 'Diagram Explanation',
    description: 'Layout: Large image/diagram at top, numbered explanation points below, detailed breakdown on back.',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'diagram',
        type: 'image',
        x: 50,
        y: 50,
        width: 500,
        height: 350,
        imageUrl: 'https://via.placeholder.com/500x350?text=Diagram+Here'
      },
      {
        id: 'diagram-points',
        type: 'text',
        x: 50,
        y: 450,
        width: 500,
        height: 300,
        content: '1. First key point\n2. Second key point\n3. Third key point',
        fontSize: 16,
        color: '#000000',
        textAlign: 'left'
      }
    ],
    back_elements: [
      {
        id: 'detailed-explanation',
        type: 'text',
        x: 50,
        y: 200,
        width: 500,
        height: 500,
        content: 'Detailed explanation of the diagram and its components',
        fontSize: 16,
        color: '#000000',
        textAlign: 'left'
      }
    ]
  },
  {
    id: 'advanced-formula',
    name: 'Formula with Examples',
    description: 'Layout: Formula title, mathematical formula, example problem below. Solution steps on back.',
    card_type: 'normal',
    canvas_width: 600,
    canvas_height: 900,
    front_elements: [
      {
        id: 'formula-title',
        type: 'text',
        x: 50,
        y: 100,
        width: 500,
        height: 60,
        content: 'Formula Name',
        fontSize: 24,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      {
        id: 'formula',
        type: 'text',
        x: 50,
        y: 200,
        width: 500,
        height: 100,
        content: 'Mathematical Formula',
        fontSize: 20,
        color: '#dc2626',
        fontFamily: 'Courier New, monospace',
        textAlign: 'center'
      },
      {
        id: 'example-problem',
        type: 'text',
        x: 50,
        y: 350,
        width: 500,
        height: 200,
        content: 'Example Problem:\nSolve for x when...',
        fontSize: 16,
        color: '#000000',
        textAlign: 'left'
      }
    ],
    back_elements: [
      {
        id: 'solution-steps',
        type: 'text',
        x: 50,
        y: 200,
        width: 500,
        height: 500,
        content: 'Solution Steps:\n1. First step\n2. Second step\n3. Final answer',
        fontSize: 16,
        color: '#000000',
        textAlign: 'left'
      }
    ]
  }
];
