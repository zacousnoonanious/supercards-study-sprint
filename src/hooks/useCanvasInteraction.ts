
import { useCanvasPanning } from './useCanvasPanning';
import { useCanvasZoom } from './useCanvasZoom';
import { useCanvasFitToView } from './useCanvasFitToView';
import { useCanvasEventHandlers } from './useCanvasEventHandlers';

interface UseCanvasInteractionProps {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  canvasViewportRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  setZoom: (zoom: number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  isPanning: boolean;
  setIsPanning: (panning: boolean) => void;
  panStart: { x: number; y: number };
  setPanStart: (start: { x: number; y: number }) => void;
  cardWidth: number;
  cardHeight: number;
}

export const useCanvasInteraction = ({
  canvasContainerRef,
  canvasViewportRef,
  zoom,
  setZoom,
  panOffset,
  setPanOffset,
  isPanning,
  setIsPanning,
  panStart,
  setPanStart,
  cardWidth,
  cardHeight,
}: UseCanvasInteractionProps) => {
  const { startPan, panCanvas, endPan, updateCursor } = useCanvasPanning({
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    panOffset,
    setPanOffset,
    canvasViewportRef,
    zoom,
  });

  const { handleWheel, isInCanvasArea } = useCanvasZoom({
    zoom,
    setZoom,
    setPanOffset,
    canvasViewportRef,
  });

  const { fitToView } = useCanvasFitToView({
    canvasViewportRef,
    cardWidth,
    cardHeight,
    setZoom,
    setPanOffset,
  });

  useCanvasEventHandlers({
    isInCanvasArea,
    isPanning,
    setIsPanning,
    setPanStart,
    panStart,
    setPanOffset,
    updateCursor,
    zoom,
    handleWheel,
    canvasViewportRef,
  });

  return {
    startPan,
    panCanvas,
    endPan,
    handleWheel,
    fitToView,
  };
};
