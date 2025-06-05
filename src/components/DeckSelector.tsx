
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlashcardSet } from '@/types/flashcard';

interface DeckSelectorProps {
  onDeckSelect: (deckId: string, deckTitle: string) => void;
  currentDeckId?: string;
  textScale?: number;
}

export const DeckSelector: React.FC<DeckSelectorProps> = ({ 
  onDeckSelect, 
  currentDeckId,
  textScale = 1
}) => {
  const { user } = useAuth();
  const { setId } = useParams();
  const [decks, setDecks] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDecks = async () => {
      try {
        const { data, error } = await supabase
          .from('flashcard_sets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Filter out the current deck to prevent self-embedding
        const filteredDecks = (data || []).filter(deck => deck.id !== setId);
        setDecks(filteredDecks);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, [user, setId]);

  if (loading) {
    return (
      <div 
        className="text-sm text-muted-foreground"
        style={{ fontSize: `${12 * textScale}px` }}
      >
        Loading decks...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 
        className="font-medium text-sm"
        style={{ fontSize: `${14 * textScale}px` }}
      >
        Select a deck to embed:
      </h3>
      <Select value={currentDeckId} onValueChange={(value) => {
        const selectedDeck = decks.find(deck => deck.id === value);
        if (selectedDeck) {
          onDeckSelect(selectedDeck.id, selectedDeck.title);
        }
      }}>
        <SelectTrigger 
          className="w-full h-8 text-xs"
          style={{ fontSize: `${12 * textScale}px` }}
        >
          <SelectValue placeholder="Choose a deck..." />
        </SelectTrigger>
        <SelectContent>
          {decks.map((deck) => (
            <SelectItem key={deck.id} value={deck.id}>
              {deck.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {decks.length === 0 && (
        <p 
          className="text-xs text-muted-foreground"
          style={{ fontSize: `${10 * textScale}px` }}
        >
          No other decks available to embed.
        </p>
      )}
    </div>
  );
};
