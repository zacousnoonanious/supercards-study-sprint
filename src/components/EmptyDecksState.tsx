
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { JoinDeckDialog } from '@/components/JoinDeckDialog';

export const EmptyDecksState: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
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
                {t('decks.joinDeck')}
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};
