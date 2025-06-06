
import { supabase } from '@/integrations/supabase/client';

export const getSet = async (id: string) => {
  const { data: setData, error: setError } = await supabase
    .from('flashcard_sets')
    .select('*')
    .eq('id', id)
    .single();
  
  if (setError) throw setError;

  const { data: flashcards, error: cardsError } = await supabase
    .from('flashcards')
    .select('*')
    .eq('set_id', id)
    .order('created_at', { ascending: true });
  
  if (cardsError) throw cardsError;

  return {
    ...setData,
    flashcards: flashcards || []
  };
};
