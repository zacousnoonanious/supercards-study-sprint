
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
}

type SnapZone = 'left' | 'right' | 'top' | 'bottom' | 'above-canvas' | 'below-settings' | null;

export const UndockableToolbar: React.FC<UndockableToolbarProps> = (props) => {
  const { theme } = useTheme();
  const [isDocked, setIsDocked] = useState(true);
  const [position, setPosition] = useState<'left' | 'right' | 'top' | 'bottom' | 'above-canvas' | 'below-settings'>('left');
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

      // Check for snap zones with improved proximity detection
      if (props.canvasRef?.current) {
        const canvasRect = props.canvasRef.current.getBoundingClientRect();
        const snapThreshold = 40;
        const toolbarRect = toolbarRef.current?.getBoundingClientRect();
        const toolbarCenterX = newX + (toolbarRect?.width || 0) / 2;
        const toolbarCenterY = newY + (toolbarRect?.height || 0) / 2;
        
        let currentSnapZone: SnapZone = null;

        // Check proximity to canvas for snapping
        const distanceToLeft = Math.abs(newX - (canvasRect.left - 60));
        const distanceToRight = Math.abs(newX - canvasRect.right);
        const distanceToTop = Math.abs(newY - (canvasRect.top - 60));
        const distanceToBottom = Math.abs(newY - canvasRect.bottom);

        // Left snap zone - must be within vertical bounds of canvas
        if (distanceToLeft < snapThreshold && 
            toolbarCenterY > canvasRect.top - 20 && 
            toolbarCenterY < canvasRect.bottom + 20) {
          currentSnapZone = 'left';
        }
        // Right snap zone - must be within vertical bounds of canvas  
        else if (distanceToRight < snapThreshold && 
                 toolbarCenterY > canvasRect.top - 20 && 
                 toolbarCenterY < canvasRect.bottom + 20) {
          currentSnapZone = 'right';
        }
        // Top snap zone (above canvas) - must be within horizontal bounds
        else if (distanceToTop < snapThreshold && 
                 toolbarCenterX > canvasRect.left - 20 && 
                 toolbarCenterX < canvasRect.right + 20) {
          currentSnapZone = 'above-canvas';
        }
        // Bottom snap zone - must be within horizontal bounds
        else if (distanceToBottom < snapThreshold && 
                 toolbarCenterX > canvasRect.left - 20 && 
                 toolbarCenterX < canvasRect.right + 20) {
          currentSnapZone = 'bottom';
        }

        // Check for below-settings snap zone
        if (props.topSettingsBarRef?.current) {
          const settingsRect = props.topSettingsBarRef.current.getBoundingClientRect();
          const distanceToSettings = Math.abs(toolbarCenterY - settingsRect.bottom);
          
          if (distanceToSettings < snapThreshold && 
              toolbarCenterX > settingsRect.left && 
              toolbarCenterX < settingsRect.right) {
            currentSnapZone = 'below-settings';
          }
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
  }, [isDragging, dragOffset, props.canvasRef, props.topSettingsBarRef, isDocked, snapZone]);

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
          left: canvasRect.left - 70,
          top: canvasRect.top,
          width: 60,
          height: canvasRect.height,
        };
      case 'right':
        return {
          ...baseStyle,
          left: canvasRect.right + 10,
          top: canvasRect.top,
          width: 60,
          height: canvasRect.height,
        };
      case 'above-canvas':
        return {
          ...baseStyle,
          left: canvasRect.left,
          top: canvasRect.top - 70,
          width: canvasRect.width,
          height: 60,
        };
      case 'bottom':
        return {
          ...baseStyle,
          left: canvasRect.left,
          top: canvasRect.bottom + 10,
          width: canvasRect.width,
          height: 60,
        };
      case 'below-settings':
        if (props.topSettingsBarRef?.current) {
          const settingsRect = props.topSettingsBarRef.current.getBoundingClientRect();
          return {
            ...baseStyle,
            left: settingsRect.left,
            top: settingsRect.bottom + 5,
            width: settingsRect.width,
            height: 50,
          };
        }
        return { display: 'none' };
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
            <div style={getSnapZoneStyle('above-canvas')} />
            <div style={getSnapZoneStyle('bottom')} />
            <div style={getSnapZoneStyle('below-settings')} />
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
          <div style={getSnapZoneStyle('above-canvas')} />
          <div style={getSnapZoneStyle('bottom')} />
          <div style={getSnapZoneStyle('below-settings')} />
        </>
      )}
    </>
  );
};
