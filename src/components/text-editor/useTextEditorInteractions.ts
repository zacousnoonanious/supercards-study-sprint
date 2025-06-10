
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

  // Simplified interactions - remove complex mouse event handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Let canvas handle dragging
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Let canvas handle dragging
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't interfere with canvas selection
  }, []);

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
