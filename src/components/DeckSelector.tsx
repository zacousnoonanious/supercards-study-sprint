import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [userSets, setUserSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [customDeckId, setCustomDeckId] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchUserSets = async () => {
      try {
        const { data, error } = await supabase
          .from('flashcard_sets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform the data to match FlashcardSet interface
        const transformedSets: FlashcardSet[] = (data || []).map(set => ({
          ...set,
          is_public: set.is_public ?? false, // Provide default value if missing
          permanent_shuffle: set.permanent_shuffle ?? false,
          description: set.description ?? ''
        }));
        
        setUserSets(transformedSets);
      } catch (error) {
        console.error('Error fetching user sets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSets();
  }, [user]);

  const handleSelectDeck = (setId: string) => {
    const selectedSet = userSets.find(set => set.id === setId);
    if (selectedSet) {
      onDeckSelect(selectedSet.id, selectedSet.title);
    }
  };

  const handleCustomDeckSelect = () => {
    if (customDeckId.trim()) {
      onDeckSelect(customDeckId.trim(), `Custom Deck (${customDeckId.trim()})`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500" style={{ fontSize: `${12 * textScale}px` }}>
          Loading your decks...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <Label className="text-sm font-medium" style={{ fontSize: `${12 * textScale}px` }}>
          Select from your decks:
        </Label>
        <Select onValueChange={handleSelectDeck} value={currentDeckId}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue 
              placeholder="Choose a deck to embed..." 
              style={{ fontSize: `${12 * textScale}px` }}
            />
          </SelectTrigger>
          <SelectContent>
            {userSets.map((set) => (
              <SelectItem key={set.id} value={set.id}>
                <div style={{ fontSize: `${12 * textScale}px` }}>
                  <div className="font-medium">{set.title}</div>
                  {set.description && (
                    <div className="text-xs text-gray-500">{set.description}</div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-medium" style={{ fontSize: `${12 * textScale}px` }}>
          Or enter a custom deck ID:
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="Enter deck ID"
            value={customDeckId}
            onChange={(e) => setCustomDeckId(e.target.value)}
            className="flex-1"
            style={{ fontSize: `${12 * textScale}px` }}
          />
          <Button
            onClick={handleCustomDeckSelect}
            disabled={!customDeckId.trim()}
            size="sm"
            style={{ fontSize: `${10 * textScale}px` }}
          >
            Use
          </Button>
        </div>
      </div>

      {userSets.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500" style={{ fontSize: `${12 * textScale}px` }}>
            You don't have any decks yet. Create a deck first to embed it.
          </p>
        </div>
      )}
    </div>
  );
};
