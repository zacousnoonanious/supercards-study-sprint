
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Undo2, RotateCcw, GripHorizontal } from 'lucide-react';

interface EnhancedDrawingCanvasProps {
  width: number;
  height: number;
  onDrawingComplete?: (drawingData: string) => void;
  initialDrawing?: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  highlightMode?: boolean;
  onDragStart?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
  isActive?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export const EnhancedDrawingCanvas: React.FC<EnhancedDrawingCanvasProps> = ({
  width,
  height,
  onDrawingComplete,
  initialDrawing,
  strokeColor = '#000000',
  strokeWidth = 2,
  opacity = 1,
  highlightMode = false,
  onDragStart,
  isDragging = false,
  isActive = false,
  onActivate,
  onDeactivate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Array<{x: number, y: number}>>([]);
  const [paths, setPaths] = useState<Array<{
    points: Array<{x: number, y: number}>,
    color: string,
    width: number,
    opacity: number
  }>>([]);
  const [isErasing, setIsErasing] = useState(false);

  // Preserve drawing when size changes
  useEffect(() => {
    if (initialDrawing && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Scale the image to fit the new canvas size
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = initialDrawing;
      }
    }
  }, [initialDrawing, width, height]);

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive || isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setCurrentPath([coords]);
  }, [isActive, isDragging]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isActive || isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getCanvasCoordinates(e);
    setCurrentPath(prev => [...prev, coords]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.globalAlpha = 1;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = highlightMode ? 0.6 : (opacity || 1);
    }

    ctx.beginPath();
    const lastPoint = currentPath[currentPath.length - 2];
    if (lastPoint) {
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  }, [isDrawing, currentPath, strokeColor, strokeWidth, isErasing, highlightMode, opacity, isActive, isDragging]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (currentPath.length > 0) {
      const newPath = {
        points: currentPath,
        color: isErasing ? 'erase' : strokeColor,
        width: strokeWidth,
        opacity: highlightMode ? 0.6 : (opacity || 1)
      };
      setPaths(prev => [...prev, newPath]);
      setCurrentPath([]);
      
      // Save drawing
      const canvas = canvasRef.current;
      if (canvas && onDrawingComplete) {
        onDrawingComplete(canvas.toDataURL());
      }
    }
  }, [isDrawing, currentPath, strokeColor, strokeWidth, isErasing, highlightMode, opacity, onDrawingComplete]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setPaths([]);
      setCurrentPath([]);
      if (onDrawingComplete) {
        onDrawingComplete('');
      }
    }
  };

  const undoLastStroke = () => {
    if (paths.length === 0) return;
    
    const newPaths = paths.slice(0, -1);
    setPaths(newPaths);
    
    // Redraw canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw all remaining paths
      newPaths.forEach(path => {
        if (path.points.length < 2) return;
        
        ctx.lineWidth = path.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (path.color === 'erase') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = 'rgba(0,0,0,1)';
          ctx.globalAlpha = 1;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = path.color;
          ctx.globalAlpha = path.opacity;
        }
        
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        path.points.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      });
      
      if (onDrawingComplete) {
        onDrawingComplete(canvas.toDataURL());
      }
    }
  };

  return (
    <div 
      className="w-full h-full bg-transparent rounded shadow-sm flex flex-col"
      style={{ opacity: opacity || 1 }}
    >
      {/* Simplified toolbar with drag handle */}
      <div 
        className="flex items-center justify-between p-1 bg-gray-50/90 border-b cursor-move select-none rounded-t"
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-1">
          <GripHorizontal className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-600">Drawing</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant={isErasing ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsErasing(!isErasing)}
            className="h-6 w-6 p-0"
            title="Toggle Eraser"
          >
            <Eraser className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={undoLastStroke}
            className="h-6 w-6 p-0"
            title="Undo"
            disabled={paths.length === 0}
          >
            <Undo2 className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCanvas}
            className="h-6 w-6 p-0"
            title="Clear All"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Drawing area */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={width - 2}
          height={height - 32}
          className="absolute inset-0 cursor-crosshair bg-transparent"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onClick={(e) => {
            e.stopPropagation();
            onActivate?.();
          }}
          style={{
            cursor: isErasing ? 'crosshair' : 'crosshair',
            pointerEvents: isActive ? 'auto' : 'none'
          }}
        />
        
        {!isActive && (
          <div 
            className="absolute inset-0 bg-transparent cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onActivate?.();
            }}
          />
        )}
      </div>
    </div>
  );
};
