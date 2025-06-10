
import { useState, useCallback } from 'react';

interface UseTextEditorInteractionsProps {
  isStudyMode: boolean;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  element: { hasTTS?: boolean; ttsEnabled?: boolean };
}

export const useTextEditorInteractions = ({
  isStudyMode,
  isEditing,
  onEditingChange,
  element,
}: UseTextEditorInteractionsProps) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarTimer, setToolbarTimer] = useState<NodeJS.Timeout | null>(null);

  const startEditing = useCallback(() => {
    if (isStudyMode && element.hasTTS && element.ttsEnabled) {
      return;
    }
    onEditingChange(true);
    setShowToolbar(false);
  }, [isStudyMode, element.hasTTS, element.ttsEnabled, onEditingChange]);

  const stopEditing = useCallback(() => {
    onEditingChange(false);
  }, [onEditingChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isEditing || isStudyMode) return;
    
    // Clear any existing timer
    if (toolbarTimer) {
      clearTimeout(toolbarTimer);
    }
    
    // Set a timer to show toolbar after hold
    const timer = setTimeout(() => {
      setShowToolbar(true);
    }, 300);
    
    setToolbarTimer(timer);
  }, [isEditing, isStudyMode, toolbarTimer]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Clear timer if mouse is released quickly
    if (toolbarTimer) {
      clearTimeout(toolbarTimer);
      setToolbarTimer(null);
    }
  }, [toolbarTimer]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isEditing && !showToolbar) {
      startEditing();
    }
  }, [isEditing, showToolbar, startEditing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    startEditing();
  }, [startEditing]);

  return {
    showToolbar,
    setShowToolbar,
    startEditing,
    stopEditing,
    handleMouseDown,
    handleMouseUp,
    handleClick,
    handleDoubleClick,
  };
};
