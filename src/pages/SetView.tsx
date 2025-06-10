
import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { SetViewSkeleton } from '@/components/LoadingSkeletons';
import { useRoutePreloader } from '@/hooks/useRoutePreloader';
import { useDataPrefetcher } from '@/hooks/useDataPrefetcher';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedSetOverview } from '@/components/EnhancedSetOverview';
import { SetViewHeader } from '@/components/set-view/SetViewHeader';
import { CardGrid } from '@/components/set-view/CardGrid';
import { SetViewDialogs } from '@/components/set-view/SetViewDialogs';
import { useSetViewLogic } from '@/hooks/useSetViewLogic';

const SetView = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Enable route preloading and data prefetching
  useRoutePreloader();
  useDataPrefetcher(user?.id);

  const {
    setId,
    isLoading,
    set,
    cards,
    showAIGenerator,
    setShowAIGenerator,
    showCardCreator,
    setShowCardCreator,
    showEnhancedOverview,
    setShowEnhancedOverview,
    showStudySettings,
    setShowStudySettings,
    showPermanentShuffleSettings,
    setShowPermanentShuffleSettings,
    defaultTemplate,
    handleAIGenerated,
    handleCardCreated,
    handleCreateCard,
    handleCreateFromTemplate,
    handleSetDefaultTemplate,
    handleDeleteCard,
    handleReorderCards,
    handleNavigateToCard,
    handleStudyFromCard,
    handleStartStudyWithSettings,
    handlePermanentShuffleToggle,
  } = useSetViewLogic();

  // Show skeleton loading immediately
  if (isLoading) {
    return <SetViewSkeleton />;
  }

  if (!set) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">{t('setView.notFound')}</h2>
            <Button onClick={() => navigate('/decks')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('setView.backToDecks')}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (showEnhancedOverview) {
    return (
      <EnhancedSetOverview
        cards={cards}
        setId={setId!}
        onReorderCards={handleReorderCards}
        onNavigateToCard={handleNavigateToCard}
        onBackToSet={() => setShowEnhancedOverview(false)}
        onCreateCard={handleCreateCard}
        onCreateFromTemplate={handleCreateFromTemplate}
        onSetDefaultTemplate={handleSetDefaultTemplate}
        onDeleteCard={handleDeleteCard}
        onStudyFromCard={handleStudyFromCard}
        defaultTemplate={defaultTemplate}
        permanentShuffle={set?.permanent_shuffle || false}
        onPermanentShuffleChange={handlePermanentShuffleToggle}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <SetViewHeader
          set={set}
          setId={setId!}
          onShowPermanentShuffleSettings={() => setShowPermanentShuffleSettings(true)}
          onShowEnhancedOverview={() => setShowEnhancedOverview(true)}
          onShowAIGenerator={() => setShowAIGenerator(true)}
          onShowStudySettings={() => setShowStudySettings(true)}
        />

        <CardGrid
          cards={cards}
          onCreateCard={handleCreateCard}
          onCreateFromTemplate={handleCreateFromTemplate}
          onSetDefaultTemplate={handleSetDefaultTemplate}
          defaultTemplate={defaultTemplate}
        />
      </main>

      <SetViewDialogs
        showAIGenerator={showAIGenerator}
        onShowAIGenerator={setShowAIGenerator}
        showCardCreator={showCardCreator}
        onShowCardCreator={setShowCardCreator}
        showStudySettings={showStudySettings}
        onShowStudySettings={setShowStudySettings}
        showPermanentShuffleSettings={showPermanentShuffleSettings}
        onShowPermanentShuffleSettings={setShowPermanentShuffleSettings}
        setId={setId!}
        set={set}
        cards={cards}
        onAIGenerated={handleAIGenerated}
        onCardCreated={handleCardCreated}
        onStartStudyWithSettings={handleStartStudyWithSettings}
        onPermanentShuffleToggle={handlePermanentShuffleToggle}
      />
    </div>
  );
};

export default SetView;
