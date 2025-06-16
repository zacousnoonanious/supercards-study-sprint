
import { supabase } from '@/integrations/supabase/client';
import { Flashcard } from '@/types/flashcard';

export const getFlashcard = async (id: string) => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createFlashcard = async (flashcard: Partial<Flashcard>) => {
  // Only include database fields
  const cardData = {
    set_id: flashcard.set_id,
    question: flashcard.question || '',
    answer: flashcard.answer || '',
    hint: flashcard.hint,
    front_elements: flashcard.front_elements as any || [],
    back_elements: flashcard.back_elements as any || [],
    card_type: flashcard.card_type || 'normal',
    interactive_type: flashcard.interactive_type,
    password: flashcard.password,
    countdown_timer: flashcard.countdown_timer || 0,
    countdown_timer_front: flashcard.countdown_timer_front || 0,
    countdown_timer_back: flashcard.countdown_timer_back || 0,
    countdown_behavior_front: flashcard.countdown_behavior_front || 'flip',
    countdown_behavior_back: flashcard.countdown_behavior_back || 'flip',
    flips_before_next: flashcard.flips_before_next || 0,
    canvas_width: flashcard.canvas_width || 600,
    canvas_height: flashcard.canvas_height || 400,
    metadata: flashcard.metadata || {},
  };

  const { data, error } = await supabase
    .from('flashcards')
    .insert(cardData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating flashcard:', error);
    throw error;
  }
  
  console.log('Flashcard created successfully:', data);
  return data;
};

export const updateFlashcard = async (flashcard: Partial<Flashcard> & { id: string }) => {
  // Only include database fields
  const updateData = {
    question: flashcard.question,
    answer: flashcard.answer,
    hint: flashcard.hint,
    front_elements: flashcard.front_elements as any,
    back_elements: flashcard.back_elements as any,
    card_type: flashcard.card_type,
    interactive_type: flashcard.interactive_type,
    password: flashcard.password,
    countdown_timer: flashcard.countdown_timer,
    countdown_timer_front: flashcard.countdown_timer_front,
    countdown_timer_back: flashcard.countdown_timer_back,
    countdown_behavior_front: flashcard.countdown_behavior_front,
    countdown_behavior_back: flashcard.countdown_behavior_back,
    flips_before_next: flashcard.flips_before_next,
    canvas_width: flashcard.canvas_width,
    canvas_height: flashcard.canvas_height,
    metadata: flashcard.metadata,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('flashcards')
    .update(updateData)
    .eq('id', flashcard.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating flashcard:', error);
    throw error;
  }
  
  console.log('Flashcard updated successfully:', data);
  return data;
};

export const deleteFlashcard = async (id: string) => {
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting flashcard:', error);
    throw error;
  }
  
  console.log('Flashcard deleted successfully');
};

export const getFlashcardsBySetId = async (setId: string): Promise<Flashcard[]> => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('set_id', setId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching flashcards:', error);
    throw error;
  }
  
  console.log('Flashcards fetched successfully:', data);
  
  // Transform database cards to full Flashcard objects
  const flashcards: Flashcard[] = (data || []).map(card => ({
    id: card.id,
    set_id: card.set_id,
    question: card.question || '',
    answer: card.answer || '',
    hint: card.hint,
    front_elements: Array.isArray(card.front_elements) ? card.front_elements as any : [],
    back_elements: Array.isArray(card.back_elements) ? card.back_elements as any : [],
    card_type: card.card_type as 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected' || 'normal',
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
    // Add default values for new properties
    allowedElementTypes: ['text', 'image', 'audio', 'drawing', 'youtube', 'tts'],
    restrictedToolbar: false,
    showBackSide: true,
    autoAdvanceOnAnswer: false,
    constraints: [],
  }));
  
  return flashcards;
};
