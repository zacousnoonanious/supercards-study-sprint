
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

type SnapZone = 'left' | 'right' | 'top' | 'bottom' | null;

export const UndockableToolbar: React.FC<UndockableToolbarProps> = (props) => {
  const { theme } = useTheme();
  const [isDocked, setIsDocked] = useState(true);
  const [position, setPosition] = useState<'left' | 'right' | 'top' | 'bottom'>('left');
  const [dragPosition, setDragPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapZone, setSnapZone] = useState<SnapZone>(null);
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
        const snapThreshold = 80;
        let currentSnapZone: SnapZone = null;

        // Left snap zone
        if (newX < canvasRect.left + snapThreshold && newY > canvasRect.top - 50 && newY < canvasRect.bottom + 50) {
          currentSnapZone = 'left';
        }
        // Right snap zone
        else if (newX > canvasRect.right - snapThreshold && newY > canvasRect.top - 50 && newY < canvasRect.bottom + 50) {
          currentSnapZone = 'right';
        }
        // Top snap zone
        else if (newY < canvasRect.top + snapThreshold && newX > canvasRect.left - 50 && newX < canvasRect.right + 50) {
          currentSnapZone = 'top';
        }
        // Bottom snap zone
        else if (newY > canvasRect.bottom - snapThreshold && newX > canvasRect.left - 50 && newX < canvasRect.right + 50) {
          currentSnapZone = 'bottom';
        }

        setSnapZone(currentSnapZone);
        if (currentSnapZone) {
          setPosition(currentSnapZone);
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        
        // Dock if we're in a snap zone
        if (snapZone) {
          setIsDocked(true);
          setPosition(snapZone);
        }
        
        setSnapZone(null);
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
  }, [isDragging, dragOffset, props.canvasRef, isDocked, snapZone]);

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
    setSnapZone(null);
  };

  const getSnapZoneStyle = (zone: SnapZone) => {
    if (!props.canvasRef?.current || snapZone !== zone) return { display: 'none' };
    
    const canvasRect = props.canvasRef.current.getBoundingClientRect();
    const baseStyle = {
      position: 'fixed' as const,
      backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
      border: `2px dashed ${isDarkTheme ? '#60a5fa' : '#3b82f6'}`,
      pointerEvents: 'none' as const,
      zIndex: 40,
      borderRadius: '8px',
    };

    switch (zone) {
      case 'left':
        return {
          ...baseStyle,
          left: canvasRect.left - 60,
          top: canvasRect.top,
          width: 50,
          height: canvasRect.height,
        };
      case 'right':
        return {
          ...baseStyle,
          left: canvasRect.right + 10,
          top: canvasRect.top,
          width: 50,
          height: canvasRect.height,
        };
      case 'top':
        return {
          ...baseStyle,
          left: canvasRect.left,
          top: canvasRect.top - 60,
          width: canvasRect.width,
          height: 50,
        };
      case 'bottom':
        return {
          ...baseStyle,
          left: canvasRect.left,
          top: canvasRect.bottom + 10,
          width: canvasRect.width,
          height: 50,
        };
      default:
        return { display: 'none' };
    }
  };

  if (isDocked) {
    return (
      <>
        <ConsolidatedToolbar
          {...props}
          position={position}
          isDocked={isDocked}
          onToggleDock={handleToggleDock}
        />
        
        {/* Snap zone indicators */}
        {isDragging && (
          <>
            <div style={getSnapZoneStyle('left')} />
            <div style={getSnapZoneStyle('right')} />
            <div style={getSnapZoneStyle('top')} />
            <div style={getSnapZoneStyle('bottom')} />
          </>
        )}
      </>
    );
  }

  return (
    <>
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
          position="floating"
          isDocked={isDocked}
          onToggleDock={handleToggleDock}
          className={`shadow-xl ${isDarkTheme ? 'border-gray-500' : 'border-gray-400'}`}
        />
      </div>
      
      {/* Snap zone indicators */}
      {isDragging && (
        <>
          <div style={getSnapZoneStyle('left')} />
          <div style={getSnapZoneStyle('right')} />
          <div style={getSnapZoneStyle('top')} />
          <div style={getSnapZoneStyle('bottom')} />
        </>
      )}
    </>
  );
};
