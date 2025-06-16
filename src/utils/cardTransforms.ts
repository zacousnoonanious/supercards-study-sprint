
import { Flashcard, CanvasElement } from '@/types/flashcard';

export const transformDatabaseCardToFlashcard = (card: any): Flashcard => {
  return {
    id: card.id,
    set_id: card.set_id,
    question: card.question || '',
    answer: card.answer || '',
    hint: card.hint,
    front_elements: Array.isArray(card.front_elements) ? card.front_elements as CanvasElement[] : [],
    back_elements: Array.isArray(card.back_elements) ? card.back_elements as CanvasElement[] : [],
    card_type: (card.card_type as 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') || 'normal',
    interactive_type: card.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank' | null,
    password: card.password,
    countdown_timer: card.countdown_timer || 0,
    countdown_timer_front: card.countdown_timer_front || 0,
    countdown_timer_back: card.countdown_timer_back || 0,
    countdown_behavior_front: (card.countdown_behavior_front as 'flip' | 'next') || 'flip',
    countdown_behavior_back: (card.countdown_behavior_back as 'flip' | 'next') || 'flip',
    flips_before_next: card.flips_before_next || 0,
    canvas_width: card.canvas_width || 600,
    canvas_height: card.canvas_height || 400,
    created_at: card.created_at,
    updated_at: card.updated_at,
    last_reviewed_at: card.last_reviewed_at,
    metadata: typeof card.metadata === 'object' && card.metadata !== null 
      ? card.metadata as { tags?: string[]; aiTags?: string[]; [key: string]: any; }
      : { tags: [], aiTags: [] },
    // Add default values for new properties that don't exist in database
    allowedElementTypes: ['text', 'image', 'audio', 'drawing', 'youtube', 'tts'],
    restrictedToolbar: false,
    showBackSide: true,
    autoAdvanceOnAnswer: false,
    constraints: [],
  };
};
