
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
  fontFamily?: string;
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
  showImmediateFeedback?: boolean;
  autoAdvanceOnAnswer?: boolean;
  
  // Fill in blank properties
  fillInBlankText?: string;
  fillInBlankBlanks?: Array<{
    word: string;
    position: number;
    id: string;
  }>;
  fillInBlankMode?: 'every-nth' | 'random' | 'sentence-start' | 'manual';
  fillInBlankInterval?: number; // For every-nth mode
  fillInBlankPercentage?: number; // For random mode (0-100)
  showLetterCount?: boolean;
  ignoreCase?: boolean;
  
  // YouTube properties
  youtubeUrl?: string;
  
  // Deck embed properties
  deckId?: string;
  deckTitle?: string;
  
  // Hyperlink property for text and image elements
  hyperlink?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
  set_id: string;
  created_at: string;
  updated_at: string;
  last_reviewed_at?: string | null;
  card_type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected';
  interactive_type?: 'multiple-choice' | 'true-false' | 'fill-in-blank' | null;
  countdown_timer?: number;
  countdown_seconds?: number;
  countdown_behavior?: 'flip' | 'next';
  password?: string | null;
  elements_json?: string;
  canvas_width?: number;
  canvas_height?: number;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  flashcards?: Flashcard[];
  permanent_shuffle?: boolean;
}

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  card_type: Flashcard['card_type'];
  canvas_width: number;
  canvas_height: number;
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
  thumbnail?: string;
}
