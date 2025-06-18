
import { useState, useCallback, useRef } from 'react';
import { Flashcard } from '@/types/flashcard';

interface CardEditorState {
  zoom: number;
  setZoom: (zoom: number) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  showBorder: boolean;
  setShowBorder: (show: boolean) => void;
  autoAlign: boolean;
  setAutoAlign: (align: boolean) => void;
  toolbarPosition: 'left' | 'very-top' | 'canvas-left' | 'floating';
  setToolbarPosition: (position: 'left' | 'very-top' | 'canvas-left' | 'floating') => void;
  toolbarIsDocked: boolean;
  setToolbarIsDocked: (docked: boolean) => void;
  toolbarShowText: boolean;
  setToolbarShowText: (showText: boolean) => void;
  isPanning: boolean;
  setIsPanning: (panning: boolean) => void;
  showCardOverview: boolean;
  setShowCardOverview: (show: boolean) => void;
}

/**
 * useCardEditorState Hook
 * 
 * PROTECTED state management for card editor visual features.
 * CRITICAL: This hook maintains protected state that should not be reset by external effects.
 */
export const useCardEditorState = (currentCard: Flashcard | null): CardEditorState => {
  // PROTECTED: Visual editor state - simplified without problematic effects
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showBorder, setShowBorder] = useState(false);
  const [autoAlign, setAutoAlign] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<'left' | 'very-top' | 'canvas-left' | 'floating'>('left');
  const [toolbarIsDocked, setToolbarIsDocked] = useState(true);
  const [toolbarShowText, setToolbarShowText] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [showCardOverview, setShowCardOverview] = useState(false);

  // PROTECTION: Simple ref for tracking without triggering effects
  const initRef = useRef(false);
  if (!initRef.current) {
    initRef.current = true;
    console.log('🔧 PROTECTED: CardEditorState initialized');
  }

  // PROTECTED: Stable setters to prevent re-render loops
  const handleSetShowGrid = useCallback((show: boolean) => {
    console.log('🔧 PROTECTED: Setting showGrid to', show);
    setShowGrid(show);
  }, []);

  const handleSetSnapToGrid = useCallback((snap: boolean) => {
    console.log('🔧 PROTECTED: Setting snapToGrid to', snap);
    setSnapToGrid(snap);
  }, []);

  const handleSetShowBorder = useCallback((show: boolean) => {
    console.log('🔧 PROTECTED: Setting showBorder to', show);
    setShowBorder(show);
  }, []);

  const handleSetAutoAlign = useCallback((align: boolean) => {
    console.log('🔧 PROTECTED: Setting autoAlign to', align);
    setAutoAlign(align);
  }, []);

  return {
    zoom,
    setZoom,
    showGrid,
    setShowGrid: handleSetShowGrid,
    snapToGrid,
    setSnapToGrid: handleSetSnapToGrid,
    showBorder,
    setShowBorder: handleSetShowBorder,
    autoAlign,
    setAutoAlign: handleSetAutoAlign,
    toolbarPosition,
    setToolbarPosition,
    toolbarIsDocked,
    setToolbarIsDocked,
    toolbarShowText,
    setToolbarShowText,
    isPanning,
    setIsPanning,
    showCardOverview,
    setShowCardOverview,
  };
};
