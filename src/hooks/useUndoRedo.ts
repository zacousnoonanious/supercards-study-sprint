import { useState, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';

interface UndoRedoState {
  elements: CanvasElement[];
  timestamp: number;
}

export const useUndoRedo = (initialElements: CanvasElement[] = []) => {
  const [history, setHistory] = useState<UndoRedoState[]>([
    { elements: initialElements, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const saveState = useCallback((elements: CanvasElement[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ elements: [...elements], timestamp: Date.now() });
      // Keep only last 10 states
      return newHistory.slice(-10);
    });
    setCurrentIndex(prev => Math.min(prev + 1, 9));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1].elements;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1].elements;
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentState: history[currentIndex]?.elements || initialElements
  };
};
