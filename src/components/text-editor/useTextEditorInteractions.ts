
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
    // Allow canvas to handle dragging by not stopping propagation
    if (isEditing) {
      e.stopPropagation();
    }
  }, [isEditing]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Allow canvas to handle dragging by not stopping propagation
    if (isEditing) {
      e.stopPropagation();
    }
  }, [isEditing]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only stop propagation if we're editing
    if (isEditing) {
      e.stopPropagation();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isStudyMode) {
      startEditing();
    }
  }, [startEditing, isStudyMode]);

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
