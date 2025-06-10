
import React, { useState } from 'react';
import { ConsolidatedToolbar } from './ConsolidatedToolbar';
import { SnapZoneIndicators } from './toolbar/SnapZoneIndicators';
import { useToolbarPositioning } from '@/hooks/useToolbarPositioning';
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

export const UndockableToolbar: React.FC<UndockableToolbarProps> = (props) => {
  const { theme } = useTheme();
  const [showText, setShowText] = useState(false);

  const {
    isDocked,
    position,
    dragPosition,
    isDragging,
    snapZone,
    toolbarRef,
    handleToggleDock,
    handleMouseDown,
    getDockedPosition
  } = useToolbarPositioning({
    canvasRef: props.canvasRef,
    onPositionChange: props.onPositionChange
  });

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  // Handle text toggle
  const handleTextToggle = () => {
    const newShowText = !showText;
    setShowText(newShowText);
    props.onTextToggle?.(newShowText);
  };

  if (isDocked) {
    return (
      <>
        <div style={position === 'canvas-left' ? {} : getDockedPosition()}>
          <ConsolidatedToolbar
            {...props}
            position={position}
            isDocked={isDocked}
            onToggleDock={handleToggleDock}
            showText={showText}
            onTextToggle={handleTextToggle}
            style={position === 'canvas-left' ? getDockedPosition() : {}}
            canvasRef={props.canvasRef}
          />
        </div>
        
        <SnapZoneIndicators
          snapZone={snapZone}
          isDragging={isDragging}
          canvasRef={props.canvasRef}
        />
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
          canvasRef={props.canvasRef}
        />
      </div>
      
      <SnapZoneIndicators
        snapZone={snapZone}
        isDragging={isDragging}
        canvasRef={props.canvasRef}
      />
    </>
  );
};
