

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'youtube' | 'deck-embed' | 'drawing' | 'audio';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  fontFamily?: string;
  textDecoration?: 'none' | 'underline' | 'line-through';
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  hyperlink?: string;
  mcOptions?: string[];
  mcCorrectAnswer?: number;
  mcCorrectAnswers?: number[];
  mcType?: 'single' | 'multiple';
  multipleChoiceOptions?: string[];
  correctAnswer?: number;
  tfCorrectAnswer?: boolean;
  fillInBlankText?: string;
  fillInBlankBlanks?: Array<{
    word: string;
    position: number;
    id: string;
  }>;
  fillInBlankMode?: 'every-nth' | 'random' | 'sentence-start' | 'manual' | 'significant-words';
  fillInBlankInterval?: number;
  fillInBlankPercentage?: number;
  showLetterCount?: boolean;
  ignoreCase?: boolean;
  youtubeUrl?: string;
  deckId?: string;
  deckTitle?: string;
  drawingData?: string;
  strokeColor?: string;
  strokeWidth?: number;
  zIndex?: number;
  rotation?: number;
  showImmediateFeedback?: boolean;
  autoAdvanceOnAnswer?: boolean;
  autoplay?: boolean;
}

export interface Flashcard {
  id: string;
  set_id: string;
  question?: string;
  answer?: string;
  hint?: string;
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
  card_type?: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected';
  countdown_timer?: number;
  countdown_behavior?: 'flip' | 'next';
  canvas_width?: number;
  canvas_height?: number;
  position: number;
  password?: string;
  interactive_type?: string;
  last_reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  is_public: boolean;
  permanent_shuffle?: boolean;
  created_at: string;
  updated_at: string;
  cards?: Flashcard[];
}

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  category?: string;
  card_type?: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected';
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
  canvas_width?: number;
  canvas_height?: number;
}

export interface StudySession {
  id: string;
  set_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  total_cards: number;
  correct_answers: number;
  incorrect_answers: number;
}

export interface StudyProgress {
  card_id: string;
  is_correct: boolean;
  time_spent: number;
  attempts: number;
}

