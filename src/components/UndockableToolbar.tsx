
import React, { useState, useRef, useEffect } from 'react';
import { ConsolidatedToolbar } from './ConsolidatedToolbar';
import { useTheme } from '@/contexts/ThemeContext';
import { Flashcard, CardTemplate } from '@/types/flashcard';

interface UndockableToolbarProps {
  onAddElement: (type: string) => void;
  onAutoArrange: (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'center-horizontal' | 'center-vertical') => void;
  currentCard: Flashcard;
  currentCardIndex: number;
  totalCards: number;
  currentSide: 'front' | 'back';
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onCreateNewCardFromTemplate: (template: CardTemplate) => void;
  onDeleteCard: () => void;
  onCardTypeChange: (type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') => void;
  onShowCardOverview?: () => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

export const UndockableToolbar: React.FC<UndockableToolbarProps> = (props) => {
  const { theme } = useTheme();
  const [isDocked, setIsDocked] = useState(true);
  const [position, setPosition] = useState<'left' | 'right' | 'top' | 'bottom'>('left');
  const [dragPosition, setDragPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isDocked) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setDragPosition({ x: newX, y: newY });

      // Check for snap zones
      if (props.canvasRef?.current) {
        const canvasRect = props.canvasRef.current.getBoundingClientRect();
        const snapThreshold = 50;

        // Left snap zone
        if (newX < canvasRect.left + snapThreshold && newY > canvasRect.top && newY < canvasRect.bottom) {
          setPosition('left');
        }
        // Right snap zone
        else if (newX > canvasRect.right - snapThreshold && newY > canvasRect.top && newY < canvasRect.bottom) {
          setPosition('right');
        }
        // Top snap zone
        else if (newY < canvasRect.top + snapThreshold && newX > canvasRect.left && newX < canvasRect.right) {
          setPosition('top');
        }
        // Bottom snap zone
        else if (newY > canvasRect.bottom - snapThreshold && newX > canvasRect.left && newX < canvasRect.right) {
          setPosition('bottom');
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        
        // Check if we should dock based on final position
        if (props.canvasRef?.current) {
          const canvasRect = props.canvasRef.current.getBoundingClientRect();
          const snapThreshold = 100;
          const toolbarRect = toolbarRef.current?.getBoundingClientRect();
          
          if (toolbarRect) {
            const centerX = toolbarRect.left + toolbarRect.width / 2;
            const centerY = toolbarRect.top + toolbarRect.height / 2;
            
            if (
              (Math.abs(centerX - canvasRect.left) < snapThreshold) ||
              (Math.abs(centerX - canvasRect.right) < snapThreshold) ||
              (Math.abs(centerY - canvasRect.top) < snapThreshold) ||
              (Math.abs(centerY - canvasRect.bottom) < snapThreshold)
            ) {
              setIsDocked(true);
            }
          }
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, props.canvasRef, isDocked]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDocked || !toolbarRef.current) return;
    
    const rect = toolbarRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleToggleDock = () => {
    setIsDocked(!isDocked);
    if (!isDocked) {
      setPosition('left'); // Default to left when docking
    }
  };

  if (isDocked) {
    return (
      <ConsolidatedToolbar
        {...props}
        position={position}
        isDocked={isDocked}
        onToggleDock={handleToggleDock}
      />
    );
  }

  return (
    <div
      ref={toolbarRef}
      className={`fixed z-50 ${isDragging ? 'cursor-move' : 'cursor-grab'}`}
      style={{
        left: dragPosition.x,
        top: dragPosition.y,
      }}
      onMouseDown={handleMouseDown}
    >
      <ConsolidatedToolbar
        {...props}
        position="left"
        isDocked={isDocked}
        onToggleDock={handleToggleDock}
        className={`shadow-xl ${isDarkTheme ? 'border-gray-500' : 'border-gray-400'}`}
      />
    </div>
  );
};
