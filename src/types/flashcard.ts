
export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'audio' | 'drawing' | 'multiple-choice' | 'true-false' | 'youtube' | 'deck-embed' | 'fill-in-blank';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  
  // Text properties
  content?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  
  // Image properties
  imageUrl?: string;
  
  // Audio properties
  audioUrl?: string;
  autoplay?: boolean;
  
  // Drawing properties
  drawingData?: string;
  strokeColor?: string;
  strokeWidth?: number;
  
  // Interactive element properties
  multipleChoiceOptions?: string[];
  correctAnswer?: number;
  
  // Fill in blank properties
  fillInBlankText?: string;
  fillInBlankBlanks?: Array<{
    word: string;
    position: number;
    id: string;
  }>;
  showLetterCount?: boolean;
  ignoreCase?: boolean;
  
  // YouTube properties
  youtubeUrl?: string;
  
  // Deck embed properties
  deckId?: string;
  deckTitle?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint: string;
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
  created_at: string;
  updated_at: string;
  set_id: string;
  last_reviewed_at: string | null;
  card_type?: 'standard' | 'informational' | 'single-sided' | 'password-protected' | 'quiz-only' | null;
  interactive_type?: 'multiple-choice' | 'true-false' | 'fill-blank' | null;
  interactive_data?: {
    options?: string[];
    correctAnswer?: number;
    explanation?: string;
  };
  password?: string | null;
  countdown_timer?: number | null;
  is_unskippable?: boolean;
  shuffle_enabled?: boolean;
  reverse_mode?: boolean;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}
