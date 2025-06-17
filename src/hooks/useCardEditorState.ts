
import { useState, useRef, useEffect } from 'react';
import { Flashcard } from '@/types/flashcard';

export const useCardEditorState = (currentCard?: Flashcard) => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCardOverview, setShowCardOverview] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [cardWidth, setCardWidth] = useState(600);
  const [cardHeight, setCardHeight] = useState(450);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [toolbarPosition, setToolbarPosition] = useState<'left' | 'very-top' | 'canvas-left' | 'floating'>('left');
  const [toolbarIsDocked, setToolbarIsDocked] = useState(true);
  const [toolbarShowText, setToolbarShowText] = useState(false);
  
  // CRITICAL: Protected visual editor states with ref tracking to prevent external resets
  const visualStateRef = useRef({
    showGrid: false,
    snapToGrid: false,
    showBorder: false,
  });

  // Protected state that cannot be overridden by external effects
  const [showGrid, setShowGridInternal] = useState(false);
  const [snapToGrid, setSnapToGridInternal] = useState(false);
  const [showBorder, setShowBorderInternal] = useState(false);
  
  const [isTextSelecting, setIsTextSelecting] = useState(false);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const topSettingsBarRef = useRef<HTMLDivElement>(null);
  const canvasViewportRef = useRef<HTMLDivElement>(null);

  // Sync canvas dimensions with current card
  useEffect(() => {
    if (currentCard) {
      const width = currentCard.canvas_width || 600;
      const height = currentCard.canvas_height || 450;
      setCardWidth(width);
      setCardHeight(height);
    }
  }, [currentCard?.id, currentCard?.canvas_width, currentCard?.canvas_height]);

  // CRITICAL: Protected visual editor handlers that update both state and ref
  const handleShowGridChange = (show: boolean) => {
    console.log('🔧 PROTECTED: Grid visibility change requested:', show);
    console.log('🔧 PROTECTED: Current grid state before change:', visualStateRef.current.showGrid);
    
    // Update both ref and state to prevent external overrides
    visualStateRef.current.showGrid = show;
    setShowGridInternal(show);
    
    console.log('🔧 PROTECTED: Grid state updated to:', show);
    console.log('🔧 PROTECTED: Ref state:', visualStateRef.current.showGrid);
  };

  const handleSnapToGridChange = (snap: boolean) => {
    console.log('🔧 PROTECTED: Snap to grid change requested:', snap);
    console.log('🔧 PROTECTED: Current snap state before change:', visualStateRef.current.snapToGrid);
    
    // Update both ref and state to prevent external overrides
    visualStateRef.current.snapToGrid = snap;
    setSnapToGridInternal(snap);
    
    console.log('🔧 PROTECTED: Snap state updated to:', snap);
    console.log('🔧 PROTECTED: Ref state:', visualStateRef.current.snapToGrid);
  };

  const handleShowBorderChange = (show: boolean) => {
    console.log('🔧 PROTECTED: Border visibility change requested:', show);
    console.log('🔧 PROTECTED: Current border state before change:', visualStateRef.current.showBorder);
    
    // Update both ref and state to prevent external overrides
    visualStateRef.current.showBorder = show;
    setShowBorderInternal(show);
    
    console.log('🔧 PROTECTED: Border state updated to:', show);
    console.log('🔧 PROTECTED: Ref state:', visualStateRef.current.showBorder);
  };

  // Monitor for external state resets and restore from ref
  useEffect(() => {
    const restoreVisualState = () => {
      if (showGrid !== visualStateRef.current.showGrid) {
        console.log('🔧 PROTECTION: Restoring grid state from', showGrid, 'to', visualStateRef.current.showGrid);
        setShowGridInternal(visualStateRef.current.showGrid);
      }
      if (snapToGrid !== visualStateRef.current.snapToGrid) {
        console.log('🔧 PROTECTION: Restoring snap state from', snapToGrid, 'to', visualStateRef.current.snapToGrid);
        setSnapToGridInternal(visualStateRef.current.snapToGrid);
      }
      if (showBorder !== visualStateRef.current.showBorder) {
        console.log('🔧 PROTECTION: Restoring border state from', showBorder, 'to', visualStateRef.current.showBorder);
        setShowBorderInternal(visualStateRef.current.showBorder);
      }
    };

    // Check for state divergence after any update
    const timeoutId = setTimeout(restoreVisualState, 10);
    return () => clearTimeout(timeoutId);
  }, [showGrid, snapToGrid, showBorder]);

  // Monitor all state changes
  useEffect(() => {
    console.log('🔧 PROTECTED: Visual Editor State Monitor:', {
      'State Grid': showGrid,
      'State Snap': snapToGrid, 
      'State Border': showBorder,
      'Ref Grid': visualStateRef.current.showGrid,
      'Ref Snap': visualStateRef.current.snapToGrid,
      'Ref Border': visualStateRef.current.showBorder
    });
  }, [showGrid, snapToGrid, showBorder]);

  return {
    showShortcuts,
    setShowShortcuts,
    showCardOverview,
    setShowCardOverview,
    deckName,
    setDeckName,
    cardWidth,
    setCardWidth,
    cardHeight,
    setCardHeight,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    toolbarPosition,
    setToolbarPosition,
    toolbarIsDocked,
    setToolbarIsDocked,
    toolbarShowText,
    setToolbarShowText,
    
    // PROTECTED visual editor features - use protected handlers
    showGrid,
    setShowGrid: handleShowGridChange,
    snapToGrid,
    setSnapToGrid: handleSnapToGridChange,
    showBorder,
    setShowBorder: handleShowBorderChange,
    
    isTextSelecting,
    setIsTextSelecting,
    canvasContainerRef,
    topSettingsBarRef,
    canvasViewportRef,
  };
};
