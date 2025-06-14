
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import { useOrganization } from '@/contexts/OrganizationContext';
import { DecksHeader } from '@/components/DecksHeader';
import { EmptyDecksState } from '@/components/EmptyDecksState';
import { DeckCard } from '@/components/DeckCard';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const Decks = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { currentOrganization, userOrganizations, isLoading: orgLoading } = useOrganization();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSets();
  }, [user, navigate, currentOrganization]);

  const fetchSets = async () => {
    try {
      let query = supabase
        .from('flashcard_sets')
        .select('*')
        .order('updated_at', { ascending: false });

      // If user has organization, show both personal and org decks
      if (currentOrganization) {
        // Show personal decks (no org) and current org decks
        query = query.or(`organization_id.is.null,organization_id.eq.${currentOrganization.id}`);
      } else {
        // Show only personal decks
        query = query.is('organization_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSets(data || []);
    } catch (error) {
      console.error('Error fetching sets:', error);
      toast({
        title: t('error.general'),
        description: t('decks.loadError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = (deletedSetId: string) => {
    setSets(sets.filter(set => set.id !== deletedSetId));
  };

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <DecksHeader currentOrganization={currentOrganization} />

        {sets.length === 0 ? (
          <EmptyDecksState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sets.map(set => (
              <DeckCard 
                key={set.id} 
                set={set} 
                onDelete={handleDeleteSet}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Decks;
