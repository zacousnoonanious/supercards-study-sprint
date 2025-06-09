
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Trash2, 
  RotateCcw, 
  Copy, 
  Move, 
  Palette,
  Type,
  Grid,
  Eye,
  EyeOff,
  Timer
} from 'lucide-react';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';

interface TopSettingsBarProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  onCanvasSizeChange: (width: number, height: number) => void;
  currentCard: Flashcard;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
  showGrid?: boolean;
  onShowGridChange?: (show: boolean) => void;
  snapToGrid?: boolean;
  onSnapToGridChange?: (snap: boolean) => void;
}

export const TopSettingsBar: React.FC<TopSettingsBarProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
  currentCard,
  onUpdateCard,
  showGrid = false,
  onShowGridChange,
  snapToGrid = false,
  onSnapToGridChange,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const handleElementUpdate = (updates: Partial<CanvasElement>) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, updates);
    }
  };

  return (
    <div className={`border-b p-2 ${isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-background border-border'}`}>
      <div className="flex items-center gap-4 flex-wrap">
        {/* Canvas Size Controls */}
        <Card className="flex-shrink-0">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Canvas Size:</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={canvasWidth}
                  onChange={(e) => onCanvasSizeChange(Number(e.target.value), canvasHeight)}
                  className="w-24 h-7 text-xs"
                  min="200"
                  max="2000"
                />
                <span className="text-xs">×</span>
                <Input
                  type="number"
                  value={canvasHeight}
                  onChange={(e) => onCanvasSizeChange(canvasWidth, Number(e.target.value))}
                  className="w-24 h-7 text-xs"
                  min="150"
                  max="2000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator orientation="vertical" className="h-8" />

        {/* Grid Controls */}
        <Card className="flex-shrink-0">
          <CardContent className="p-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShowGridChange?.(!showGrid)}
                  className="h-7 px-2"
                >
                  {showGrid ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span className="ml-1 text-xs">Grid</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Snap:</Label>
                <Switch
                  checked={snapToGrid}
                  onCheckedChange={onSnapToGridChange}
                  className="scale-75"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator orientation="vertical" className="h-8" />

        {/* Timer Settings */}
        <Card className="flex-shrink-0">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Timer className="w-3 h-3" />
              <Label className="text-xs whitespace-nowrap">Timer (s):</Label>
              <Input
                type="number"
                value={currentCard?.countdown_timer || 0}
                onChange={(e) => onUpdateCard({ countdown_timer: Number(e.target.value) })}
                className="w-20 h-7 text-xs"
                min="0"
                max="300"
                placeholder="0"
              />
              <div className="flex items-center gap-1">
                <Label className="text-xs">Auto:</Label>
                <Switch
                  checked={currentCard?.countdown_behavior === 'next'}
                  onCheckedChange={(checked) => onUpdateCard({ countdown_behavior: checked ? 'next' : 'flip' })}
                  className="scale-75"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator orientation="vertical" className="h-8" />

        {/* Element Controls */}
        {selectedElement && (
          <Card className="flex-shrink-0">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Element:</Label>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteElement(selectedElement.id)}
                  className="h-7 px-2"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="ml-1 text-xs">Delete</span>
                </Button>
                
                {selectedElement.type === 'text' && (
                  <>
                    <div className="flex items-center gap-1">
                      <Input
                        type="color"
                        value={selectedElement.color || '#000000'}
                        onChange={(e) => handleElementUpdate({ color: e.target.value })}
                        className="w-8 h-7 p-0 border-0"
                      />
                      <Input
                        type="number"
                        value={selectedElement.fontSize || 16}
                        onChange={(e) => handleElementUpdate({ fontSize: Number(e.target.value) })}
                        className="w-16 h-7 text-xs"
                        min="8"
                        max="72"
                        placeholder="Size"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
