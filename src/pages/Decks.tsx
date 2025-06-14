import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Edit, Trash2, Play, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import { JoinDeckDialog } from '@/components/JoinDeckDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSetId, setDeletingSetId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSets();
  }, [user, navigate]);

  const fetchSets = async () => {
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .order('updated_at', { ascending: false });

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

  const deleteSet = async (id: string, title: string) => {
    setDeletingSetId(id);
    try {
      console.log('Deleting set:', id);
      
      // Delete all flashcards in the set first
      const { error: cardsError } = await supabase
        .from('flashcards')
        .delete()
        .eq('set_id', id);

      if (cardsError) {
        console.error('Error deleting cards:', cardsError);
        throw cardsError;
      }

      // Delete the set (AI generation records will be automatically deleted via CASCADE)
      const { error: setError } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', id);

      if (setError) {
        console.error('Error deleting set:', setError);
        throw setError;
      }

      setSets(sets.filter(set => set.id !== id));
      toast({
        title: t('success.deleted'),
        description: t('decks.deleteSuccess').replace('{title}', title)
      });
    } catch (error) {
      console.error('Error deleting set:', error);
      toast({
        title: t('error.general'),
        description: t('decks.deleteError'),
        variant: "destructive"
      });
    } finally {
      setDeletingSetId(null);
    }
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-foreground">{t('decks.title')}</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <JoinDeckDialog 
              trigger={
                <Button variant="outline" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Join Deck
                </Button>
              }
            />
            <Button onClick={() => navigate('/create-set')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('decks.createNew')}
            </Button>
          </div>
        </div>

        {sets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">{t('decks.noDecks')}</h3>
              <p className="text-muted-foreground mb-4">{t('decks.noDecksDesc')}</p>
              <div className="flex justify-center gap-2">
                <Button onClick={() => navigate('/create-set')}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('decks.createFirst')}
                </Button>
                <JoinDeckDialog 
                  trigger={
                    <Button variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Existing Deck
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sets.map(set => (
              <Card key={set.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{set.title}</span>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/edit-cards/${set.id}`)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={deletingSetId === set.id}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('decks.deleteConfirm')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('decks.deleteMessage').replace('{title}', set.title)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSet(set.id, set.title)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t('delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                  <CardDescription>{set.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => navigate(`/set/${set.id}`)} className="flex-1">
                      {t('decks.viewCards')}
                    </Button>
                    <Button onClick={() => navigate(`/study/${set.id}`)} className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      {t('decks.study')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Decks;
