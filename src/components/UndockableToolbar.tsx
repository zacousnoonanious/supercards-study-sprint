
import React, { useState } from 'react';
import { ConsolidatedToolbar } from './ConsolidatedToolbar';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { Flashcard, CardTemplate } from '@/types/flashcard';

interface UndockableToolbarProps {
  onAddElement: (type: string) => void;
  onAutoArrange: (type: 'grid' | 'center' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'center-horizontal' | 'center-vertical') => void;
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
  const { t } = useI18n();
  const [showText, setShowText] = useState(false);

  // Handle text toggle
  const handleTextToggle = () => {
    const newShowText = !showText;
    setShowText(newShowText);
    props.onTextToggle?.(newShowText);
  };

  // For the new embedded layout, we just render the toolbar directly
  // The positioning is handled by the parent CardEditorLayout
  return (
    <ConsolidatedToolbar
      {...props}
      position="left"
      isDocked={true}
      showText={showText}
      onTextToggle={handleTextToggle}
      canvasRef={props.canvasRef}
    />
  );
};
