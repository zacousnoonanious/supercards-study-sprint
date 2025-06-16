
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Save, Users, Eye } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { KeyboardShortcutsHelper } from './KeyboardShortcutsHelper';
import { CardNavigationButtons } from './CardNavigationButtons';
import { Flashcard } from '@/types/flashcard';
import { CollaboratorInfo, CollaborativeUser } from '@/hooks/useCollaborativeEditing';

interface TopToolbarProps {
  deckName: string;
  currentCardIndex: number;
  cards: Flashcard[];
  showShortcuts?: boolean;
  showCardOverview?: boolean;
  onDeckTitleChange: (title: string) => Promise<void>;
  onShowCardOverviewChange?: (show: boolean) => void;
  collaborationDialog?: React.ReactNode;
  activeUsers?: CollaborativeUser[];
  collaborators?: CollaboratorInfo[];
  currentCardId?: string;
  isCollaborative?: boolean;
  onNavigateCard?: (direction: 'prev' | 'next') => void;
  onSave?: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  deckName,
  currentCardIndex,
  cards,
  showShortcuts = true,
  showCardOverview = false,
  onDeckTitleChange,
  onShowCardOverviewChange,
  collaborationDialog,
  activeUsers = [],
  collaborators = [],
  currentCardId,
  isCollaborative = false,
  onNavigateCard,
  onSave,
}) => {
  const { t } = useI18n();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(deckName);

  const handleTitleEdit = () => {
    setEditingTitle(deckName);
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (editingTitle !== deckName) {
      await onDeckTitleChange(editingTitle);
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(deckName);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14">
      <div className="flex items-center space-x-4">
        {/* Deck Title */}
        <div className="flex items-center">
          {isEditingTitle ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyDown}
              className="text-lg font-semibold border-none shadow-none p-0 h-auto bg-transparent"
              autoFocus
            />
          ) : (
            <h1 
              className="text-lg font-semibold cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              onClick={handleTitleEdit}
              title="Click to edit title"
            >
              {deckName}
            </h1>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Card Navigation */}
        {onNavigateCard && (
          <>
            <CardNavigationButtons
              currentCardIndex={currentCardIndex}
              totalCards={cards.length}
              onNavigate={onNavigateCard}
            />
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* Collaboration Status */}
        {isCollaborative && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              {activeUsers.length} active
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Card Overview Toggle */}
        {onShowCardOverviewChange && (
          <Button
            variant={showCardOverview ? "default" : "outline"}
            size="sm"
            onClick={() => onShowCardOverviewChange(!showCardOverview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Overview
          </Button>
        )}

        {/* Collaboration Dialog */}
        {collaborationDialog}

        <Separator orientation="vertical" className="h-6" />

        {/* Keyboard Shortcuts Helper */}
        {showShortcuts && <KeyboardShortcutsHelper />}

        {/* Save Button */}
        {onSave && (
          <Button onClick={onSave} variant="default" size="sm">
            <Save className="w-4 h-4 mr-2" />
            {t('toolbar.save')}
          </Button>
        )}
      </div>
    </div>
  );
};
