
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

  // CRITICAL: Create truly stable handlers using useCallback with empty dependencies
  const stableSetZoom = useCallback((zoom: number) => {
    console.log('🔧 PROTECTED: Setting zoom to', zoom);
    setZoom(zoom);
  }, []);

  const stableSetShowGrid = useCallback((show: boolean) => {
    console.log('🔧 PROTECTED: Setting showGrid to', show);
    setShowGrid(show);
  }, []);

  const stableSetSnapToGrid = useCallback((snap: boolean) => {
    console.log('🔧 PROTECTED: Setting snapToGrid to', snap);
    setSnapToGrid(snap);
  }, []);

  const stableSetShowBorder = useCallback((show: boolean) => {
    console.log('🔧 PROTECTED: Setting showBorder to', show);
    setShowBorder(show);
  }, []);

  const stableSetAutoAlign = useCallback((align: boolean) => {
    console.log('🔧 PROTECTED: Setting autoAlign to', align);
    setAutoAlign(align);
  }, []);

  const stableSetToolbarPosition = useCallback((position: 'left' | 'very-top' | 'canvas-left' | 'floating') => {
    console.log('🔧 PROTECTED: Setting toolbarPosition to', position);
    setToolbarPosition(position);
  }, []);

  const stableSetToolbarIsDocked = useCallback((docked: boolean) => {
    console.log('🔧 PROTECTED: Setting toolbarIsDocked to', docked);
    setToolbarIsDocked(docked);
  }, []);

  const stableSetToolbarShowText = useCallback((showText: boolean) => {
    console.log('🔧 PROTECTED: Setting toolbarShowText to', showText);
    setToolbarShowText(showText);
  }, []);

  const stableSetIsPanning = useCallback((panning: boolean) => {
    console.log('🔧 PROTECTED: Setting isPanning to', panning);
    setIsPanning(panning);
  }, []);

  const stableSetShowCardOverview = useCallback((show: boolean) => {
    console.log('🔧 PROTECTED: Setting showCardOverview to', show);
    setShowCardOverview(show);
  }, []);

  return {
    zoom,
    setZoom: stableSetZoom,
    showGrid,
    setShowGrid: stableSetShowGrid,
    snapToGrid,
    setSnapToGrid: stableSetSnapToGrid,
    showBorder,
    setShowBorder: stableSetShowBorder,
    autoAlign,
    setAutoAlign: stableSetAutoAlign,
    toolbarPosition,
    setToolbarPosition: stableSetToolbarPosition,
    toolbarIsDocked,
    setToolbarIsDocked: stableSetToolbarIsDocked,
    toolbarShowText,
    setToolbarShowText: stableSetToolbarShowText,
    isPanning,
    setIsPanning: stableSetIsPanning,
    showCardOverview,
    setShowCardOverview: stableSetShowCardOverview,
  };
};
