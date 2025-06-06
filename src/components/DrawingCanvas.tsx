
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Paintbrush, Eraser, RotateCcw, Move, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface DrawingCanvasProps {
  width: number;
  height: number;
  onDrawingComplete: (drawingData: string) => void;
  initialDrawing?: string;
  strokeColor?: string;
  strokeWidth?: number;
  onDragStart?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  onDrawingComplete,
  initialDrawing,
  strokeColor = '#000000',
  strokeWidth = 2,
  onDragStart,
  isDragging = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(strokeWidth);
  const [currentColor, setCurrentColor] = useState(strokeColor);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (initialDrawing && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = `data:image/svg+xml,${encodeURIComponent(initialDrawing)}`;
      }
    }
  }, [initialDrawing]);

  const startDrawing = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = currentStrokeWidth;
      ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,0)' : currentColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      onDrawingComplete(dataURL);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDrawingComplete('');
      }
    }
  };

  // Prevent default dragging behavior when actively drawing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDrawing) {
      e.stopPropagation();
    }
  };

  const expandedWidth = Math.min(600, window.innerWidth - 40);
  const expandedHeight = Math.min(400, window.innerHeight - 200);
  const canvasWidth = isExpanded ? expandedWidth - 40 : Math.min(width, 400);
  const canvasHeight = isExpanded ? expandedHeight - 120 : Math.min(height, 200);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg border ${
        isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
      } ${isExpanded ? 'fixed z-50 shadow-2xl' : ''}`}
      style={isExpanded ? { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: expandedWidth,
        height: expandedHeight
      } : {}}
      onMouseDown={handleMouseDown}
    >
      {/* Drag Handle - Only draggable area */}
      <div 
        className={`flex items-center justify-between p-2 cursor-move ${
          isDarkTheme ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-100 border-b border-gray-200'
        } select-none`}
        onMouseDown={onDragStart}
        style={{ cursor: isDrawing ? 'default' : 'move' }}
      >
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4" />
          <span className="text-sm font-medium">Drawing Tools</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </Button>
      </div>

      {/* Tools - Non-draggable area */}
      <div className="p-3 space-y-3" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={tool === 'brush' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('brush')}
            className="flex items-center gap-1 h-7"
          >
            <Paintbrush className="w-3 h-3" />
            Brush
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('eraser')}
            className="flex items-center gap-1 h-7"
          >
            <Eraser className="w-3 h-3" />
            Eraser
          </Button>

          <div className="flex items-center gap-2">
            <Label className="text-xs">Size:</Label>
            <Slider
              value={[currentStrokeWidth]}
              onValueChange={(value) => setCurrentStrokeWidth(value[0])}
              max={20}
              min={1}
              step={1}
              className="w-16"
            />
            <span className="text-xs w-4">{currentStrokeWidth}</span>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs">Color:</Label>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-6 h-6 rounded border cursor-pointer"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            className="flex items-center gap-1 h-7"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </Button>
        </div>

        {/* Canvas - Non-draggable area */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className={`border rounded cursor-crosshair ${
              isDarkTheme ? 'border-gray-600' : 'border-gray-300'
            }`}
            style={{ backgroundColor: 'transparent', maxWidth: '100%', maxHeight: '100%' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};
