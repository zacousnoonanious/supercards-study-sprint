
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { DecksHeader } from '@/components/DecksHeader';
import { DeckCard } from '@/components/DeckCard';
import { EmptyDecksState } from '@/components/EmptyDecksState';
import { LoadingSkeletons } from '@/components/LoadingSkeletons';
import { SRSProgress } from '@/components/SRSProgress';
import { useDataPrefetcher } from '@/hooks/useDataPrefetcher';

const Decks = () => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');

  useDataPrefetcher(user?.id);

  const { data: flashcardSets = [], isLoading } = useQuery({
    queryKey: ['flashcard_sets', user?.id, currentOrganization?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('flashcard_sets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (currentOrganization?.id) {
        query = query.eq('organization_id', currentOrganization.id);
      } else {
        // Show all decks owned by the user if no organization is selected.
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching flashcard sets:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filteredSets = flashcardSets.filter(set =>
    set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (set.description && set.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteDeck = async (deckId: string) => {
    // TODO: Implement deck deletion logic
    console.log('Delete deck:', deckId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <LoadingSkeletons.DecksHeader />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <LoadingSkeletons.SRSProgress />
          </div>
          <div className="lg:col-span-3">
            <LoadingSkeletons.DeckGrid />
          </div>
        </div>
      </div>
    );
  }

  if (flashcardSets.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <DecksHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SRSProgress />
          </div>
          <div className="lg:col-span-3">
            <EmptyDecksState />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DecksHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SRS Progress Sidebar */}
        <div className="lg:col-span-1">
          <SRSProgress />
        </div>
        
        {/* Decks Grid */}
        <div className="lg:col-span-3">
          {filteredSets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No decks found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSets.map((set) => (
                <DeckCard key={set.id} set={set} onDelete={handleDeleteDeck} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Decks;
