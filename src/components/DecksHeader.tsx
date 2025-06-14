
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { JoinDeckDialog } from '@/components/JoinDeckDialog';

interface DecksHeaderProps {
  currentOrganization: { name: string } | null;
}

export const DecksHeader: React.FC<DecksHeaderProps> = ({ currentOrganization }) => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{t('decks.title')}</h2>
        {currentOrganization && (
          <p className="text-sm text-muted-foreground">
            {currentOrganization.name}
          </p>
        )}
      </div>
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
  );
};
