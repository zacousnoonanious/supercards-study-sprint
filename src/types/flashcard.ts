
export interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  allow_copying?: boolean;
  language?: string;
  source_language?: string;
  target_language?: string;
  accent_color?: string;
  cover_image?: string;
  permanent_shuffle?: boolean;
}

export interface Flashcard {
  id: string;
  set_id: string;
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
  created_at: string;
  updated_at: string;
  card_type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected';
  canvas_width?: number;
  canvas_height?: number;
  
  // Additional properties used throughout the app
  question?: string;
  answer?: string;
  hint?: string;
  countdown_timer?: number;
  countdown_timer_front?: number;
  countdown_timer_back?: number;
  countdown_behavior?: 'flip' | 'next';
  countdown_behavior_front?: 'flip' | 'next';
  countdown_behavior_back?: 'flip' | 'next';
  flips_before_next?: number;
  password?: string;
  interactive_type?: string;
  last_reviewed_at?: string;
  metadata?: any;
  position?: number;
  
  // Template-driven configuration properties
  allowedElementTypes?: string[];
  autoAdvanceOnAnswer?: boolean;
  showBackSide?: boolean;
  restrictedToolbar?: boolean;
  templateId?: string;
}

export interface CardTemplate {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: 'study' | 'quiz' | 'information' | 'vocab' | 'custom';
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
  
  // Complete card configuration
  card_type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected';
  canvas_width: number;
  canvas_height: number;
  
  // Template behavior settings
  allowedElementTypes: string[];
  autoAdvanceOnAnswer: boolean;
  showBackSide: boolean;
  restrictedToolbar: boolean;
  
  // Timer settings
  countdown_timer_front?: number;
  countdown_timer_back?: number;
  countdown_behavior_front?: 'flip' | 'next';
  countdown_behavior_back?: 'flip' | 'next';
  
  // UI preferences
  showGrid?: boolean;
  snapToGrid?: boolean;
  showBorder?: boolean;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'audio' | 'drawing' | 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'youtube' | 'deck-embed' | 'tts';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  rotation?: number;
  
  // Text properties
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontFamily?: string;
  backgroundColor?: string;
  
  // TTS properties
  hasTTS?: boolean;
  ttsEnabled?: boolean;
  ttsAutoplay?: boolean;
  ttsVoice?: string;
  ttsRate?: number;
  ttsPitch?: number;
  
  // Image properties
  imageUrl?: string;
  opacity?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  borderRadius?: boolean;
  
  // Audio properties
  audioUrl?: string;
  autoplay?: boolean;
  
  // Drawing properties
  drawingData?: string;
  strokeColor?: string;
  strokeWidth?: number;
  highlightMode?: boolean;
  
  // Interactive properties
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  isCorrect?: boolean;
  
  // Multiple choice properties
  multipleChoiceOptions?: string[];
  showImmediateFeedback?: boolean;
  autoAdvanceOnAnswer?: boolean;
  
  // Fill-in-blank properties
  blanks?: Array<{
    id: string;
    word: string;
    startIndex: number;
    endIndex: number;
  }>;
  fillInBlankText?: string;
  fillInBlankBlanks?: Array<{
    id: string;
    word: string;
    position: number;
  }>;
  ignoreCase?: boolean;
  showLetterCount?: boolean;
  fillInBlankMode?: boolean;
  
  // YouTube properties
  youtubeUrl?: string;
  youtubeId?: string;
  youtubeVideoId?: string;
  youtubeAutoplay?: boolean;
  youtubeMuted?: boolean;
  youtubeStartTime?: number;
  
  // Deck embed properties
  deckId?: string;
  deckTitle?: string;
  
  // General properties
  hyperlink?: string;
}
