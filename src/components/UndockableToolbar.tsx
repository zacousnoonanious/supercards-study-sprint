
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
  topSettingsBarRef?: React.RefObject<HTMLDivElement>;
  onPositionChange?: (position: 'left' | 'very-top' | 'canvas-left' | 'floating', isDocked: boolean) => void;
  onTextToggle?: (showText: boolean) => void;
}

type SnapZone = 'left' | 'very-top' | 'canvas-left' | null;

export const UndockableToolbar: React.FC<UndockableToolbarProps> = (props) => {
  const { theme } = useTheme();
  const [isDocked, setIsDocked] = useState(true);
  const [position, setPosition] = useState<'left' | 'very-top' | 'canvas-left' | 'floating'>('left');
  const [dragPosition, setDragPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapZone, setSnapZone] = useState<SnapZone>(null);
  const [showText, setShowText] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  // Handle text toggle
  const handleTextToggle = () => {
    const newShowText = !showText;
    setShowText(newShowText);
    props.onTextToggle?.(newShowText);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isDocked) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setDragPosition({ x: newX, y: newY });

      // Check for snap zones
      const snapThreshold = 60;
      const toolbarRect = toolbarRef.current?.getBoundingClientRect();
      const toolbarCenterX = newX + (toolbarRect?.width || 0) / 2;
      const toolbarCenterY = newY + (toolbarRect?.height || 0) / 2;
      
      let currentSnapZone: SnapZone = null;

      // Left snap zone - check if close to left edge of screen
      const distanceToLeft = Math.abs(newX);
      if (distanceToLeft < snapThreshold && toolbarCenterY > 100) {
        currentSnapZone = 'left';
      }
      
      // Very top snap zone - check if close to top edge of screen
      const distanceToTop = Math.abs(newY);
      if (distanceToTop < snapThreshold && toolbarCenterX > 50 && toolbarCenterX < window.innerWidth - 50) {
        currentSnapZone = 'very-top';
      }

      // Canvas-left snap zone - check if close to canvas area
      const canvasRect = props.canvasRef?.current?.getBoundingClientRect();
      if (canvasRect) {
        const distanceToCanvasLeft = Math.abs(newX - (canvasRect.left - 80));
        const isWithinCanvasHeight = toolbarCenterY > canvasRect.top && toolbarCenterY < canvasRect.bottom;
        if (distanceToCanvasLeft < snapThreshold && isWithinCanvasHeight) {
          currentSnapZone = 'canvas-left';
        }
      }

      setSnapZone(currentSnapZone);
      if (currentSnapZone) {
        setPosition(currentSnapZone);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        
        // Dock if we're in a snap zone
        if (snapZone) {
          setIsDocked(true);
          setPosition(snapZone);
          props.onPositionChange?.(snapZone, true);
        } else {
          props.onPositionChange?.('floating', false);
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
  }, [isDragging, dragOffset, isDocked, snapZone, props]);

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
    const newIsDocked = !isDocked;
    setIsDocked(newIsDocked);
    if (!newIsDocked) {
      setPosition('floating');
      props.onPositionChange?.('floating', false);
    } else {
      setPosition('left');
      props.onPositionChange?.('left', true);
    }
    setSnapZone(null);
  };

  const getSnapZoneStyle = (zone: SnapZone) => {
    if (snapZone !== zone) return { display: 'none' };
    
    const baseStyle = {
      position: 'fixed' as const,
      backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
      border: `2px dashed ${isDarkTheme ? '#60a5fa' : '#3b82f6'}`,
      pointerEvents: 'none' as const,
      zIndex: 40,
      borderRadius: '8px',
    };

    const canvasRect = props.canvasRef?.current?.getBoundingClientRect();

    switch (zone) {
      case 'left':
        return {
          ...baseStyle,
          left: 0,
          top: 100,
          width: 60,
          height: window.innerHeight - 100,
        };
      case 'very-top':
        return {
          ...baseStyle,
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: 60,
        };
      case 'canvas-left':
        return {
          ...baseStyle,
          left: canvasRect ? canvasRect.left - 80 : 100,
          top: canvasRect?.top || 200,
          width: 60,
          height: canvasRect?.height || 400,
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
          showText={showText}
          onTextToggle={handleTextToggle}
        />
        
        {/* Snap zone indicators */}
        {isDragging && (
          <>
            <div style={getSnapZoneStyle('left')} />
            <div style={getSnapZoneStyle('very-top')} />
            <div style={getSnapZoneStyle('canvas-left')} />
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
          showText={showText}
          onTextToggle={handleTextToggle}
          className={`shadow-xl ${isDarkTheme ? 'border-gray-500' : 'border-gray-400'}`}
        />
      </div>
      
      {/* Snap zone indicators */}
      {isDragging && (
        <>
          <div style={getSnapZoneStyle('left')} />
          <div style={getSnapZoneStyle('very-top')} />
          <div style={getSnapZoneStyle('canvas-left')} />
        </>
      )}
    </>
  );
};
