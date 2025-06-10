
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';

export const QuickActions: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.quickActions')}</CardTitle>
        <CardDescription>{t('dashboard.quickActionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate('/create-set')} className="flex-1">
            {t('dashboard.createNewDeck')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/decks')} className="flex-1">
            {t('dashboard.browseDecks')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/marketplace')} className="flex-1">
            {t('dashboard.exploreMarketplace')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
