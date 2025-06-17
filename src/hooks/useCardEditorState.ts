
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
  
  // CRITICAL: These visual editor states are LOCAL ONLY - they should NEVER sync with database
  // They are purely for DOM visualization and user interaction feedback
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showBorder, setShowBorder] = useState(false);
  
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

  // Enhanced handlers for visual editor features with comprehensive logging
  const handleShowGridChange = (show: boolean) => {
    console.log('🔧 Visual Editor: Grid visibility REQUESTED:', show);
    console.log('🔧 Current grid state before change:', showGrid);
    setShowGrid(show);
    console.log('🔧 Grid state change completed, new value should be:', show);
    
    // Verify state change took effect
    setTimeout(() => {
      console.log('🔧 Grid state verification (after timeout):', show);
    }, 100);
  };

  const handleSnapToGridChange = (snap: boolean) => {
    console.log('🔧 Visual Editor: Snap to grid REQUESTED:', snap);
    console.log('🔧 Current snap state before change:', snapToGrid);
    setSnapToGrid(snap);
    console.log('🔧 Snap state change completed, new value should be:', snap);
    
    // Verify state change took effect
    setTimeout(() => {
      console.log('🔧 Snap state verification (after timeout):', snap);
    }, 100);
  };

  const handleShowBorderChange = (show: boolean) => {
    console.log('🔧 Visual Editor: Border visibility REQUESTED:', show);
    console.log('🔧 Current border state before change:', showBorder);
    setShowBorder(show);
    console.log('🔧 Border state change completed, new value should be:', show);
    
    // Verify state change took effect
    setTimeout(() => {
      console.log('🔧 Border state verification (after timeout):', show);
    }, 100);
  };

  // Add effect to monitor state changes
  useEffect(() => {
    console.log('🔧 Visual Editor State Monitor - Grid:', showGrid, 'Snap:', snapToGrid, 'Border:', showBorder);
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
    
    // Visual editor features - LOCAL ONLY with enhanced handlers
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
