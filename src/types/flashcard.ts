
export interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  organization_id?: string;
  is_collaborative: boolean;
  collaboration_settings: {
    allowEditors: boolean;
    allowViewers: boolean;
    requireApproval: boolean;
  };
  permanent_shuffle: boolean;
  created_at: string;
  updated_at: string;
}

export interface CardTemplate {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
  card_type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected';
  canvas_width: number;
  canvas_height: number;
  allowedElementTypes: string[];
  restrictedToolbar: boolean;
  showBackSide: boolean;
  autoAdvanceOnAnswer: boolean;
  countdown_timer_front?: number;
  countdown_timer_back?: number;
}

export interface Flashcard {
  id: string;
  set_id: string;
  question: string;
  answer: string;
  hint?: string;
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
  card_type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected';
  interactive_type: 'multiple-choice' | 'true-false' | 'fill-in-blank' | null;
  password?: string | null;
  countdown_timer: number;
  countdown_timer_front: number;
  countdown_timer_back: number;
  countdown_behavior_front: 'flip' | 'next';
  countdown_behavior_back: 'flip' | 'next';
  flips_before_next: number;
  canvas_width: number;
  canvas_height: number;
  created_at: string;
  updated_at: string;
  last_reviewed_at: string | null;
  metadata: {
    tags?: string[];
    aiTags?: string[];
    [key: string]: any;
  };
  templateId?: string;
  allowedElementTypes: string[];
  restrictedToolbar: boolean;
  showBackSide: boolean;
  autoAdvanceOnAnswer: boolean;
  constraints: any[];
}

// Updated link data interface
export interface ElementLinkData {
  url: string;
  target: '_blank' | '_self';
  text: string;
  type?: 'card-jump' | 'external' | 'action';
  targetCardId?: string;
  actionType?: string;
  actionData?: any;
}

// Updated fill-in-blank blank interface with index signature for Json compatibility
export interface FillInBlankBlank {
  id: string;
  answer: string;
  word?: string;
  position?: number;
  [key: string]: any; // Index signature for Json compatibility
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'audio' | 'drawing' | 'youtube' | 'video' | 'iframe' | 'embedded-deck' | 'deck-embed' | 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'tts';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  opacity?: number;
  content?: string;
  
  // Text-specific properties
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  backgroundColor?: string;
  
  // Image-specific properties
  imageUrl?: string;
  imageFit?: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  borderRadius?: number;
  
  // Audio-specific properties
  audioUrl?: string;
  
  // Video/YouTube-specific properties
  videoUrl?: string;
  youtubeVideoId?: string;
  videoId?: string;
  youtubeAutoplay?: boolean;
  youtubeUrl?: string;
  youtubeMuted?: boolean;
  youtubeStartTime?: number;
  autoplay?: boolean;
  
  // Multiple choice properties
  multipleChoiceOptions?: string[];
  correctAnswer?: number | boolean;
  showImmediateFeedback?: boolean;
  autoAdvanceOnAnswer?: boolean;
  
  // Fill in blank properties
  fillInBlankText?: string;
  fillInBlankAnswers?: string[];
  fillInBlankBlanks?: FillInBlankBlank[];
  showLetterCount?: boolean;
  ignoreCase?: boolean;
  
  // Drawing-specific properties
  drawingData?: string;
  strokeColor?: string;
  strokeWidth?: number;
  
  // TTS properties
  hasTTS?: boolean;
  ttsText?: string;
  ttsVoice?: string;
  ttsSpeed?: number;
  ttsPitch?: number;
  ttsAutoplay?: boolean;
  ttsRate?: number;
  text?: string; // For TTS content
  rate?: number; // TTS rate
  pitch?: number; // TTS pitch
  
  // Link properties
  hyperlink?: string;
  linkData?: ElementLinkData;
  
  // Interactive properties
  isInteractive?: boolean;
  interactionType?: 'click' | 'hover' | 'drag';
  
  // Deck embed properties
  embeddedDeckId?: string;
  embeddedDeckTitle?: string;
  deckTitle?: string;
  deckId?: string;
  
  // Timer properties
  hasTimer?: boolean;
  timerDuration?: number;
  timerAutoStart?: boolean;
  timerBehavior?: 'flip' | 'next' | 'none';
}
