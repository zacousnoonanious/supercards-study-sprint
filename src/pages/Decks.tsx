import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Edit, Trash2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { UserDropdown } from '@/components/UserDropdown';
import { Navigation } from '@/components/Navigation';
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
        title: "Error",
        description: "Failed to load your flashcard decks.",
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
      
      // First, delete AI generation records that reference this set
      const { error: aiGenError } = await supabase
        .from('ai_flashcard_generations')
        .delete()
        .eq('set_id', id);

      if (aiGenError) {
        console.error('Error deleting AI generation records:', aiGenError);
        throw aiGenError;
      }

      // Delete all flashcards in the set
      const { error: cardsError } = await supabase
        .from('flashcards')
        .delete()
        .eq('set_id', id);

      if (cardsError) {
        console.error('Error deleting cards:', cardsError);
        throw cardsError;
      }

      // Finally delete the set itself
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
        title: "Success",
        description: `Deck "${title}" deleted successfully.`
      });
    } catch (error) {
      console.error('Error deleting set:', error);
      toast({
        title: "Error",
        description: "Failed to delete deck. Please try again.",
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
      <header className="shadow-sm border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-indigo-600">SuperCards</h1>
              <Navigation />
            </div>
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-foreground">My Decks</h2>
          <Button onClick={() => navigate('/create-set')} className="flex items-center gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Create New Deck
          </Button>
        </div>

        {sets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No decks yet</h3>
              <p className="text-muted-foreground mb-4">Create your first flashcard deck to get started!</p>
              <Button onClick={() => navigate('/create-set')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Deck
              </Button>
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
                            <AlertDialogTitle>Delete Deck</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{set.title}"? This action cannot be undone and will permanently delete all cards in this deck.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSet(set.id, set.title)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
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
                      View Cards
                    </Button>
                    <Button onClick={() => navigate(`/study/${set.id}`)} className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Study
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
