
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
  const cardData = {
    ...flashcard,
    // Ensure required fields have defaults
    allowedElementTypes: flashcard.allowedElementTypes || ['text', 'image', 'audio', 'drawing', 'youtube', 'tts'],
    restrictedToolbar: flashcard.restrictedToolbar || false,
    showBackSide: flashcard.showBackSide !== false,
    autoAdvanceOnAnswer: flashcard.autoAdvanceOnAnswer || false,
    constraints: flashcard.constraints || [],
    countdown_timer: flashcard.countdown_timer || 0,
    countdown_timer_front: flashcard.countdown_timer_front || 0,
    countdown_timer_back: flashcard.countdown_timer_back || 0,
    countdown_behavior_front: flashcard.countdown_behavior_front || 'flip',
    countdown_behavior_back: flashcard.countdown_behavior_back || 'flip',
    flips_before_next: flashcard.flips_before_next || 0,
    canvas_width: flashcard.canvas_width || 600,
    canvas_height: flashcard.canvas_height || 400,
    front_elements: flashcard.front_elements || [],
    back_elements: flashcard.back_elements || [],
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
  const { data, error } = await supabase
    .from('flashcards')
    .update(flashcard)
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

export const getFlashcardsBySetId = async (setId: string) => {
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
  return data || [];
};
