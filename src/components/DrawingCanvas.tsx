
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Paintbrush, Eraser, RotateCcw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface DrawingCanvasProps {
  width: number;
  height: number;
  onDrawingComplete: (drawingData: string) => void;
  initialDrawing?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  onDrawingComplete,
  initialDrawing,
  strokeColor = '#000000',
  strokeWidth = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(strokeWidth);
  const [currentColor, setCurrentColor] = useState(strokeColor);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [paths, setPaths] = useState<Array<{
    path: string;
    color: string;
    width: number;
  }>>([]);

  useEffect(() => {
    if (initialDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0);
          img.src = `data:image/svg+xml,${encodeURIComponent(initialDrawing)}`;
        }
      }
    }
  }, [initialDrawing]);

  const startDrawing = (e: React.MouseEvent) => {
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
    if (!isDrawing) return;

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
      setPaths(prev => [...prev, {
        path: canvas.toDataURL('image/png'),
        color: currentColor,
        width: currentStrokeWidth,
      }]);

      // Convert to transparent SVG format for saving
      const svgData = canvasToTransparentSVG(canvas);
      onDrawingComplete(svgData);
    }
  };

  const canvasToTransparentSVG = (canvas: HTMLCanvasElement): string => {
    const dataURL = canvas.toDataURL('image/png');
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <image href="${dataURL}" width="${width}" height="${height}" style="mix-blend-mode: multiply;"/>
    </svg>`;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setPaths([]);
        onDrawingComplete('');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          <Button
            variant={tool === 'brush' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('brush')}
            className="flex items-center gap-2"
          >
            <Paintbrush className="w-4 h-4" />
            Brush
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('eraser')}
            className="flex items-center gap-2"
          >
            <Eraser className="w-4 h-4" />
            Eraser
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm">Size:</Label>
          <Slider
            value={[currentStrokeWidth]}
            onValueChange={(value) => setCurrentStrokeWidth(value[0])}
            max={20}
            min={1}
            step={1}
            className="w-20"
          />
          <span className="text-sm w-8">{currentStrokeWidth}</span>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm">Color:</Label>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-8 h-8 rounded border"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`border rounded cursor-crosshair ${
          isDarkTheme ? 'border-gray-600' : 'border-gray-300'
        }`}
        style={{ backgroundColor: 'transparent' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};
