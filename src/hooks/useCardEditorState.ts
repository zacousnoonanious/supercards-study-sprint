
import { useState, useCallback } from 'react';
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
  // PROTECTED: Visual editor state - completely isolated
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

  // PROTECTION: Memoized stable setters to prevent infinite re-renders
  // These handlers MUST be stable to prevent Switch components from re-rendering infinitely
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

  // Memoize all other setters for consistency and performance
  const handleSetZoom = useCallback((zoom: number) => {
    console.log('🔧 PROTECTED: Setting zoom to', zoom);
    setZoom(zoom);
  }, []);

  const handleSetToolbarPosition = useCallback((position: 'left' | 'very-top' | 'canvas-left' | 'floating') => {
    console.log('🔧 PROTECTED: Setting toolbarPosition to', position);
    setToolbarPosition(position);
  }, []);

  const handleSetToolbarIsDocked = useCallback((docked: boolean) => {
    console.log('🔧 PROTECTED: Setting toolbarIsDocked to', docked);
    setToolbarIsDocked(docked);
  }, []);

  const handleSetToolbarShowText = useCallback((showText: boolean) => {
    console.log('🔧 PROTECTED: Setting toolbarShowText to', showText);
    setToolbarShowText(showText);
  }, []);

  const handleSetIsPanning = useCallback((panning: boolean) => {
    console.log('🔧 PROTECTED: Setting isPanning to', panning);
    setIsPanning(panning);
  }, []);

  const handleSetShowCardOverview = useCallback((show: boolean) => {
    console.log('🔧 PROTECTED: Setting showCardOverview to', show);
    setShowCardOverview(show);
  }, []);

  return {
    zoom,
    setZoom: handleSetZoom,
    showGrid,
    setShowGrid: handleSetShowGrid,
    snapToGrid,
    setSnapToGrid: handleSetSnapToGrid,
    showBorder,
    setShowBorder: handleSetShowBorder,
    autoAlign,
    setAutoAlign: handleSetAutoAlign,
    toolbarPosition,
    setToolbarPosition: handleSetToolbarPosition,
    toolbarIsDocked,
    setToolbarIsDocked: handleSetToolbarIsDocked,
    toolbarShowText,
    setToolbarShowText: handleSetToolbarShowText,
    isPanning,
    setIsPanning: handleSetIsPanning,
    showCardOverview,
    setShowCardOverview: handleSetShowCardOverview,
  };
};
