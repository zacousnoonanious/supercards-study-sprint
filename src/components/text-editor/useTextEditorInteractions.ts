
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
    // Stop propagation when editing to prevent canvas from handling the event
    if (isEditing) {
      e.stopPropagation();
    }
  }, [isEditing]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Stop propagation when editing to prevent canvas from handling the event
    if (isEditing) {
      e.stopPropagation();
    }
  }, [isEditing]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Stop propagation when editing to prevent canvas from handling the event
    if (isEditing) {
      e.stopPropagation();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isStudyMode && !isEditing) {
      startEditing();
    }
  }, [startEditing, isStudyMode, isEditing]);

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
