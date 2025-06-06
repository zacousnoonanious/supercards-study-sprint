
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Pin, PinOff } from 'lucide-react';
import { CanvasOverlayToolbar } from './CanvasOverlayToolbar';
import { FlashcardSet, Flashcard } from '@/types/flashcard';

interface LockableToolbarProps {
  set: FlashcardSet;
  currentCard: Flashcard;
  currentCardIndex: number;
  totalCards: number;
  currentSide: 'front' | 'back';
  onAddElement: (type: string) => void;
  onUpdateCard: (cardId: string, updates: Partial<Flashcard>) => void;
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onDeleteCard: () => Promise<boolean>;
  onSave: () => void;
  onAutoArrange?: (type: 'grid' | 'center' | 'justify' | 'stack') => void;
}

export const LockableToolbar: React.FC<LockableToolbarProps> = (props) => {
  const [isLocked, setIsLocked] = useState(false);
  const [dockPosition, setDockPosition] = useState<'top' | 'left'>('top');

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const toggleDockPosition = () => {
    setDockPosition(dockPosition === 'top' ? 'left' : 'top');
  };

  const getToolbarClasses = () => {
    if (!isLocked) {
      return "absolute top-4 left-4 right-4 z-20";
    }

    if (dockPosition === 'top') {
      return "fixed top-0 left-0 right-0 z-50 shadow-lg";
    } else {
      return "fixed top-0 left-0 bottom-0 z-50 w-16 shadow-lg";
    }
  };

  const getContentClasses = () => {
    if (!isLocked) return "";
    
    if (dockPosition === 'top') {
      return "pt-16"; // Add padding to account for fixed top toolbar
    } else {
      return "pl-16"; // Add padding to account for fixed left toolbar
    }
  };

  return (
    <>
      <div className={getToolbarClasses()}>
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLock}
                className="h-6 w-6 p-0"
                title={isLocked ? "Unlock toolbar" : "Lock toolbar"}
              >
                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </Button>
              
              {isLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDockPosition}
                  className="h-6 w-6 p-0"
                  title={`Dock to ${dockPosition === 'top' ? 'left' : 'top'}`}
                >
                  {dockPosition === 'top' ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
                </Button>
              )}
            </div>
          </div>
          
          <CanvasOverlayToolbar
            {...props}
            isCompact={isLocked && dockPosition === 'left'}
            orientation={dockPosition === 'left' ? 'vertical' : 'horizontal'}
          />
        </div>
      </div>
      
      {/* Spacer div to push content down/right when toolbar is locked */}
      {isLocked && <div className={getContentClasses()} />}
    </>
  );
};
