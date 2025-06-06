
import { supabase } from '@/integrations/supabase/client';

export const getFlashcard = async (id: string) => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createFlashcard = async (flashcard: any) => {
  const { data, error } = await supabase
    .from('flashcards')
    .insert(flashcard)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateFlashcard = async (flashcard: any) => {
  const { data, error } = await supabase
    .from('flashcards')
    .update(flashcard)
    .eq('id', flashcard.id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteFlashcard = async (id: string) => {
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
