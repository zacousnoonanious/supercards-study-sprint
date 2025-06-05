
export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'multiple-choice' | 'true-false' | 'youtube' | 'deck-embed' | 'audio' | 'drawing';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  imageUrl?: string;
  // Multiple choice specific
  multipleChoiceOptions?: string[];
  correctAnswer?: number;
  // YouTube specific
  youtubeUrl?: string;
  autoplay?: boolean;
  // Deck embed specific
  deckId?: string;
  deckTitle?: string;
  // Audio specific
  audioUrl?: string;
  // Drawing specific
  drawingData?: string; // SVG path data
  strokeColor?: string;
  strokeWidth?: number;
  animated?: boolean;
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
  card_type?: 'standard' | 'informational' | 'single-sided' | 'password-protected' | 'quiz-only' | 'timed-challenge';
  interactive_type?: 'multiple-choice' | 'true-false' | 'fill-blank' | null;
  interactive_data?: {
    options?: string[];
    correctAnswer?: number;
    explanation?: string;
  };
  password?: string;
  countdown_timer?: number;
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
