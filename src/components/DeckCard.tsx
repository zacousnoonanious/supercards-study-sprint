
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
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

interface DeckCardProps {
  set: FlashcardSet;
  onDelete: (id: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ set, onDelete }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      console.log('Deleting set:', set.id);
      
      // Delete all flashcards in the set first
      const { error: cardsError } = await supabase
        .from('flashcards')
        .delete()
        .eq('set_id', set.id);

      if (cardsError) {
        console.error('Error deleting cards:', cardsError);
        throw cardsError;
      }

      // Delete the set (AI generation records will be automatically deleted via CASCADE)
      const { error: setError } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', set.id);

      if (setError) {
        console.error('Error deleting set:', setError);
        throw setError;
      }

      onDelete(set.id);
      toast({
        title: t('success.deleted'),
        description: t('decks.deleteSuccess').replace('{title}', set.title)
      });
    } catch (error) {
      console.error('Error deleting set:', error);
      toast({
        title: t('error.general'),
        description: t('decks.deleteError'),
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{set.title}</span>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/set/${set.id}`)}>
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={deleting}
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
                    onClick={handleDelete}
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
          <Button onClick={() => navigate(`/set/${set.id}/study`)} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            {t('decks.study')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
