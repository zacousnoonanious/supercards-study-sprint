
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Pin, PinOff, GripVertical } from 'lucide-react';
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
  isBackSideDisabled?: boolean;
}

export const LockableToolbar: React.FC<LockableToolbarProps> = (props) => {
  const [isLocked, setIsLocked] = useState(false);
  const [dockPosition, setDockPosition] = useState<'top' | 'left'>('top');
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const toggleDockPosition = () => {
    setDockPosition(dockPosition === 'top' ? 'left' : 'top');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isLocked) return;
    
    // Get viewport dimensions and toolbar dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const toolbarElement = toolbarRef.current;
    
    if (toolbarElement) {
      const toolbarRect = toolbarElement.getBoundingClientRect();
      
      // Calculate new position with constraints
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;
      
      // Constrain to viewport bounds
      newX = Math.max(0, Math.min(newX, viewportWidth - toolbarRect.width));
      newY = Math.max(80, Math.min(newY, viewportHeight - toolbarRect.height - 20)); // Account for header
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const getToolbarClasses = () => {
    if (!isLocked) {
      return "absolute z-20 max-w-[90vw]"; // Add max width constraint
    }

    if (dockPosition === 'top') {
      return "fixed top-20 left-0 right-0 z-50 shadow-lg px-4";
    } else {
      return "fixed top-20 left-0 bottom-0 z-50 w-20 shadow-lg";
    }
  };

  const getToolbarStyle = () => {
    if (!isLocked) {
      return {
        left: position.x,
        top: position.y,
      };
    }
    return {};
  };

  const getContentClasses = () => {
    if (!isLocked) return "";
    
    if (dockPosition === 'top') {
      return "pt-20"; // Add padding to account for fixed top toolbar
    } else {
      return "pl-20"; // Add padding to account for fixed left toolbar
    }
  };

  return (
    <>
      <div 
        ref={toolbarRef}
        className={getToolbarClasses()}
        style={getToolbarStyle()}
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-1">
              {!isLocked && (
                <div 
                  className="cursor-move p-1"
                  onMouseDown={handleMouseDown}
                  title="Drag to move toolbar"
                >
                  <GripVertical className="w-3 h-3 text-gray-500" />
                </div>
              )}
              
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
            orientation={
              !isLocked ? 'vertical' : 
              dockPosition === 'left' ? 'vertical' : 'horizontal'
            }
          />
        </div>
      </div>
      
      {/* Spacer div to push content down/right when toolbar is locked */}
      {isLocked && <div className={getContentClasses()} />}
    </>
  );
};
