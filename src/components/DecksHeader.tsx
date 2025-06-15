
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, UserPlus, ShoppingBag, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { JoinDeckDialog } from '@/components/JoinDeckDialog';

interface DecksHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const DecksHeader: React.FC<DecksHeaderProps> = ({ searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t('decks.title')}</h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {t('nav.marketplace')}
          </Button>
          <JoinDeckDialog 
            trigger={
              <Button variant="outline" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                {t('decks.joinDeck')}
              </Button>
            }
          />
          <Button onClick={() => navigate('/create-set')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('decks.createNew')}
          </Button>
        </div>
      </div>
      
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search decks..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};
