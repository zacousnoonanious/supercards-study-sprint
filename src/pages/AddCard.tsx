
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { InteractiveCardCreator } from '@/components/InteractiveCardCreator';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

const AddCard = () => {
  const { setId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  console.log('AddCard: setId from params:', setId);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleCardCreated = () => {
    console.log('AddCard: Card created, navigating back to set:', setId);
    navigate(`/sets/${setId}`);
  };

  const handleClose = () => {
    console.log('AddCard: Closing, navigating back to set:', setId);
    navigate(`/sets/${setId}`);
  };

  if (!setId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">{t('addCard.setIdNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('addCard.backToSet')}
          </Button>
          <h2 className="text-2xl font-bold text-foreground">{t('addCard.addNewCard')}</h2>
        </div>
        
        <div className="flex items-center justify-center">
          <InteractiveCardCreator
            setId={setId}
            onCardCreated={handleCardCreated}
            onClose={handleClose}
          />
        </div>
      </main>
    </div>
  );
};

export default AddCard;
