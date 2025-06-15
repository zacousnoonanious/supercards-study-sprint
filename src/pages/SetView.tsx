import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { CollaborationDialog } from '@/components/collaboration/CollaborationDialog';
import { CollaborationIndicator } from '@/components/collaboration/CollaborationIndicator';
import { useCollaborativeEditing } from '@/hooks/useCollaborativeEditing';
import { TemplateLibrary } from '@/components/TemplateLibrary';

const SetView = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id: urlSetId } = useParams<{ id: string }>();

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

  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  // Add collaborative editing functionality
  const {
    activeUsers,
    collaborators,
    isCollaborative,
    enableCollaboration,
    removeCollaborator,
  } = useCollaborativeEditing({ setId: urlSetId || '', cardId: undefined });

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
        setId={urlSetId!}
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
          setId={urlSetId!}
          onShowPermanentShuffleSettings={() => setShowPermanentShuffleSettings(true)}
          onShowEnhancedOverview={() => setShowEnhancedOverview(true)}
          onShowAIGenerator={() => setShowAIGenerator(true)}
          onShowStudySettings={() => setShowStudySettings(true)}
        />

        {/* Add collaboration indicator if collaborative */}
        {isCollaborative && (
          <div className="mb-4 flex justify-between items-center">
            <CollaborationIndicator
              activeUsers={activeUsers}
              collaborators={collaborators}
              isCollaborative={isCollaborative}
            />
            <CollaborationDialog
              setId={urlSetId!}
              collaborators={collaborators}
              isCollaborative={isCollaborative}
              onEnableCollaboration={enableCollaboration}
              onRemoveCollaborator={removeCollaborator}
            />
          </div>
        )}

        {/* Add collaboration button if not collaborative yet */}
        {!isCollaborative && set?.user_id === user?.id && (
          <div className="mb-4 flex justify-end">
            <CollaborationDialog
              setId={urlSetId!}
              collaborators={collaborators}
              isCollaborative={isCollaborative}
              onEnableCollaboration={enableCollaboration}
              onRemoveCollaborator={removeCollaborator}
            />
          </div>
        )}

        <CardGrid
          cards={cards}
          setId={urlSetId!}
          onCreateFromTemplate={handleCreateFromTemplate}
          onSetDefaultTemplate={handleSetDefaultTemplate}
          defaultTemplate={defaultTemplate}
          onBrowseTemplates={() => setShowTemplateLibrary(true)}
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
        setId={urlSetId!}
        set={set}
        cards={cards}
        onAIGenerated={handleAIGenerated}
        onCardCreated={handleCardCreated}
        onStartStudyWithSettings={handleStartStudyWithSettings}
        onPermanentShuffleToggle={handlePermanentShuffleToggle}
      />

      {showTemplateLibrary && (
        <TemplateLibrary
          onClose={() => setShowTemplateLibrary(false)}
          onSelectTemplate={(template) => {
            handleCreateFromTemplate(template);
            setShowTemplateLibrary(false);
          }}
        />
      )}
    </div>
  );
};

export default SetView;
