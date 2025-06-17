

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CardEditor } from '@/components/CardEditor';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const CardEditorPage = () => {
  const { setId, cardId } = useParams<{ setId: string; cardId?: string }>();
  const navigate = useNavigate(); 
  const { user } = useAuth();
  
  console.log('CardEditorPage: Mounted with setId:', setId, 'cardId:', cardId);
  
  useEffect(() => {
    console.log('CardEditorPage: useEffect triggered', { setId, cardId, user: !!user });
    
    // If no cardId is provided, fetch the first card and redirect
    if (setId && !cardId && user) {
      const fetchFirstCard = async () => {
        try {
          console.log('CardEditorPage: Fetching first card for setId:', setId);
          const { data: cards, error } = await supabase
            .from('flashcards')
            .select('id')
            .eq('set_id', setId)
            .order('created_at', { ascending: true })
            .limit(1);

          if (error) {
            console.error('CardEditorPage: Error fetching first card:', error);
            throw error;
          }

          if (cards && cards.length > 0) {
            console.log('CardEditorPage: Redirecting to first card:', cards[0].id);
            navigate(`/edit/${setId}/${cards[0].id}`, { replace: true });
          } else {
            console.log('CardEditorPage: No cards found in set, staying on editor page');
            // Don't redirect if no cards found - let the editor handle creating a new card
          }
        } catch (error) {
          console.error('CardEditorPage: Error in fetchFirstCard:', error);
        }
      };

      fetchFirstCard();
    }
  }, [setId, cardId, user, navigate]);
  
  if (!setId) {
    console.log('CardEditorPage: No setId provided');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Set not found</div>
      </div>
    );
  }
  
  console.log('CardEditorPage: Rendering CardEditor with setId:', setId);
  return (
    <div className="min-h-screen bg-background">
      <CardEditor />
    </div>
  );
};

export default CardEditorPage;

