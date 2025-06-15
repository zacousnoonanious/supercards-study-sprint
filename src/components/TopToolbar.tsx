
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, MoreHorizontal, Eye } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { EditableDeckTitle } from './EditableDeckTitle';
import { CollaborationIndicator } from './collaboration/CollaborationIndicator';
import { CollaborativeUser, CollaboratorInfo } from '@/hooks/useCollaborativeEditing';
import { useI18n } from '@/contexts/I18nContext';

interface TopToolbarProps {
  deckName: string;
  currentCardIndex: number;
  cards: Flashcard[];
  showShortcuts: boolean;
  showCardOverview: boolean;
  onDeckTitleChange: (title: string) => Promise<void>;
  onShowCardOverviewChange: (show: boolean) => void;
  collaborationDialog?: React.ReactNode;
  // Collaboration props
  activeUsers?: CollaborativeUser[];
  collaborators?: CollaboratorInfo[];
  currentCardId?: string;
  isCollaborative?: boolean;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  deckName,
  currentCardIndex,
  cards,
  showShortcuts,
  showCardOverview,
  onDeckTitleChange,
  onShowCardOverviewChange,
  collaborationDialog,
  activeUsers = [],
  collaborators = [],
  currentCardId,
  isCollaborative = false,
}) => {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <EditableDeckTitle
          title={deckName}
          onTitleUpdate={onDeckTitleChange}
        />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {t('common.cardProgress', { current: currentCardIndex + 1, total: cards.length })}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Collaboration Indicator - inline */}
        {isCollaborative && (
          <CollaborationIndicator
            activeUsers={activeUsers}
            collaborators={collaborators}
            currentCardId={currentCardId}
            isCollaborative={isCollaborative}
          />
        )}
        
        {collaborationDialog}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onShowCardOverviewChange(!showCardOverview)}
        >
          <Eye className="w-4 h-4 mr-2" />
          {t('toolbar.overview')}
        </Button>
        
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
