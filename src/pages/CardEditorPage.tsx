
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CardEditor } from '@/components/CardEditor';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const CardEditorPage = () => {
  const { setId, cardId, id } = useParams<{ setId?: string; cardId?: string; id?: string }>();
  const navigate = useNavigate(); 
  const { user } = useAuth();
  
  // Handle both route patterns: /edit/:setId/:cardId and /set/:id/edit/:cardId
  const actualSetId = setId || id;
  
  console.log('CardEditorPage: Mounted with params:', { setId, cardId, id, actualSetId, user: !!user });
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!actualSetId) {
      console.error('CardEditorPage: No set ID provided');
      navigate('/dashboard');
      return;
    }

    // If no cardId is provided, fetch the first card and redirect
    if (actualSetId && !cardId) {
      const fetchFirstCard = async () => {
        try {
          console.log('CardEditorPage: Fetching first card for setId:', actualSetId);
          const { data: cards, error } = await supabase
            .from('flashcards')
            .select('id')
            .eq('set_id', actualSetId)
            .order('created_at', { ascending: true })
            .limit(1);

          if (error) {
            console.error('CardEditorPage: Error fetching first card:', error);
            throw error;
          }

          if (cards && cards.length > 0) {
            console.log('CardEditorPage: Redirecting to first card:', cards[0].id);
            // Use the same route pattern that was used to get here
            if (setId) {
              navigate(`/edit/${actualSetId}/${cards[0].id}`, { replace: true });
            } else {
              navigate(`/set/${actualSetId}/edit/${cards[0].id}`, { replace: true });
            }
          } else {
            console.log('CardEditorPage: No cards found in set, staying on editor page');
            // Don't redirect if no cards found - let the editor handle creating a new card
          }
        } catch (error) {
          console.error('CardEditorPage: Error in fetchFirstCard:', error);
          // If there's an error fetching cards, show a meaningful error
          navigate('/dashboard');
        }
      };

      fetchFirstCard();
    }
  }, [actualSetId, cardId, user, navigate, setId]);
  
  if (!actualSetId) {
    console.log('CardEditorPage: No setId provided');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Set not found</div>
      </div>
    );
  }
  
  console.log('CardEditorPage: Rendering CardEditor with setId:', actualSetId, 'cardId:', cardId);
  return (
    <div className="min-h-screen bg-background">
      <CardEditor />
    </div>
  );
};

export default CardEditorPage;
