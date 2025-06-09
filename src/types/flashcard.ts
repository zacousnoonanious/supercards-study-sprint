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
}

export interface CardTemplate {
  id: string;
  name: string;
  image: string;
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
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
  textAlign?: 'left' | 'center' | 'right';
  
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
  
  // Drawing properties
  drawingData?: string;
  strokeColor?: string;
  strokeWidth?: number;
  
  // Interactive properties
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  isCorrect?: boolean;
  
  // Fill-in-blank properties
  blanks?: Array<{
    id: string;
    word: string;
    startIndex: number;
    endIndex: number;
  }>;
  
  // YouTube properties
  youtubeUrl?: string;
  youtubeId?: string;
  
  // Deck embed properties
  deckId?: string;
  deckTitle?: string;
  
  // General properties
  hyperlink?: string;
}
