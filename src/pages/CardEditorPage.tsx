
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CardEditor } from '@/components/CardEditor';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const CardEditorPage = () => {
  const { id, cardId } = useParams<{ id: string; cardId?: string }>();
  const navigate = useNavigate(); 
  const { user } = useAuth();
  
  useEffect(() => {
    // If no cardId is provided, fetch the first card and redirect
    if (id && !cardId && user) {
      const fetchFirstCard = async () => {
        try {
          const { data: cards, error } = await supabase
            .from('flashcards')
            .select('id')
            .eq('set_id', id)
            .order('created_at', { ascending: true })
            .limit(1);

          if (error) throw error;

          if (cards && cards.length > 0) {
            navigate(`/sets/${id}/cards/${cards[0].id}`, { replace: true });
          } else {
            // No cards found, stay on this page but show appropriate message
            console.log('No cards found in set');
          }
        } catch (error) {
          console.error('Error fetching first card:', error);
        }
      };

      fetchFirstCard();
    }
  }, [id, cardId, user, navigate]);
  
  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Set not found</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <CardEditor setId={id} />
    </div>
  );
};

export default CardEditorPage;
