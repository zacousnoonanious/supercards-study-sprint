
export interface Flashcard {
  id: string;
  set_id: string;
  question: string;
  answer: string;
  hint?: string;
  front_content?: string;
  back_content?: string;
  front_elements?: CanvasElement[];
  back_elements?: CanvasElement[];
  card_type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected';
  interactive_type?: 'multiple-choice' | 'true-false' | 'fill-in-blank' | null;
  password?: string;
  countdown_timer?: number;
  countdown_timer_front?: number;
  countdown_timer_back?: number;
  countdown_behavior_front?: string;
  countdown_behavior_back?: string;
  flips_before_next?: number;
  canvas_width?: number;
  canvas_height?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
  last_reviewed_at?: string;
}

export interface FlashcardSet {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  permanent_shuffle?: boolean;
  is_collaborative?: boolean;
  collaboration_settings?: {
    allowEditors: boolean;
    allowViewers: boolean;
    requireApproval: boolean;
  };
  organization_id?: string;
}

export interface ElementLinkData {
  type: 'card-jump' | 'action';
  targetCardId?: string;
  actionType?: 'play-audio' | 'show-hint' | 'reveal-answer' | 'embed-deck';
  actionData?: string;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'audio' | 'tts' | 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'youtube' | 'deck-embed' | 'drawing';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
  hyperlink?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  textDecoration?: string;
  opacity?: number;
  border?: string;
  borderRadius?: number;
  shadow?: string;
  
  // Interactive element properties
  options?: string[];
  correctAnswer?: number;
  correctAnswers?: number[];
  explanation?: string;
  
  // TTS properties
  text?: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  
  // YouTube properties
  videoId?: string;
  startTime?: number;
  endTime?: number;
  
  // Deck embed properties
  deckId?: string;
  title?: string;
  cardCount?: number;
  
  // Link functionality
  linkData?: ElementLinkData;
  
  // Layout constraints (from previous feature)
  layoutConstraints?: any[];
}

export interface StudySession {
  id: string;
  user_id: string;
  set_id: string;
  started_at: string;
  ended_at?: string;
  total_time_seconds?: number;
  cards_reviewed?: number;
  correct_answers?: number;
  incorrect_answers?: number;
  study_mode?: string;
  srs_enabled?: boolean;
  organization_id?: string;
}

export interface UserCardStats {
  id: string;
  user_id: string;
  card_id: string;
  total_reviews: number;
  correct_reviews: number;
  last_reviewed_at?: string;
  next_review_date?: string;
  current_interval_days?: number;
  current_ease_factor?: number;
  created_at: string;
  updated_at: string;
}
