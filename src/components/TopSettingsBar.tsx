
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Timer,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
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
  currentSide?: 'front' | 'back';
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
  currentSide = 'front',
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const handleElementUpdate = (updates: Partial<CanvasElement>) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, updates);
    }
  };

  const getCurrentTimer = () => {
    if (currentSide === 'front') {
      return currentCard?.countdown_timer_front || 0;
    }
    return currentCard?.countdown_timer_back || 0;
  };

  const getCurrentBehavior = () => {
    if (currentSide === 'front') {
      return currentCard?.countdown_behavior_front || 'flip';
    }
    return currentCard?.countdown_behavior_back || 'next';
  };

  const handleTimerUpdate = (value: number) => {
    if (currentSide === 'front') {
      onUpdateCard({ countdown_timer_front: value });
    } else {
      onUpdateCard({ countdown_timer_back: value });
    }
  };

  const handleBehaviorUpdate = (behavior: 'flip' | 'next') => {
    if (currentSide === 'front') {
      onUpdateCard({ countdown_behavior_front: behavior });
    } else {
      onUpdateCard({ countdown_behavior_back: behavior });
    }
  };

  const bothSidesHaveTimers = (currentCard?.countdown_timer_front || 0) > 0 && (currentCard?.countdown_timer_back || 0) > 0;
  const bothSidesFlip = currentCard?.countdown_behavior_front === 'flip' && currentCard?.countdown_behavior_back === 'flip';
  const showFlipCount = bothSidesHaveTimers && bothSidesFlip;

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

        {/* Timer Settings - Side Specific */}
        <Card className="flex-shrink-0">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Timer className="w-3 h-3" />
              <Label className="text-xs whitespace-nowrap">{currentSide === 'front' ? 'Front' : 'Back'} Timer (s):</Label>
              <Input
                type="number"
                value={getCurrentTimer()}
                onChange={(e) => handleTimerUpdate(Number(e.target.value))}
                className="w-20 h-7 text-xs"
                min="0"
                max="300"
                placeholder="0"
              />
              {getCurrentTimer() > 0 && (
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Action:</Label>
                  <Select
                    value={getCurrentBehavior()}
                    onValueChange={(value: 'flip' | 'next') => handleBehaviorUpdate(value)}
                  >
                    <SelectTrigger className="w-20 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flip">Flip</SelectItem>
                      <SelectItem value="next">Next</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Flip Count - Only show when both sides have timers and both are set to flip */}
        {showFlipCount && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <Card className="flex-shrink-0">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">Flips before next:</Label>
                  <Input
                    type="number"
                    value={currentCard.flips_before_next || 2}
                    onChange={(e) => onUpdateCard({ flips_before_next: Number(e.target.value) || 2 })}
                    className="w-16 h-7 text-xs"
                    min="1"
                    max="10"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

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
                    {/* Text Style Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant={selectedElement.fontWeight === 'bold' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleElementUpdate({ 
                          fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
                        })}
                        className="h-7 px-2"
                      >
                        <Bold className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={selectedElement.fontStyle === 'italic' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleElementUpdate({ 
                          fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
                        })}
                        className="h-7 px-2"
                      >
                        <Italic className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={selectedElement.textDecoration === 'underline' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleElementUpdate({ 
                          textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
                        })}
                        className="h-7 px-2"
                      >
                        <Underline className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Text Alignment Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleElementUpdate({ textAlign: 'left' })}
                        className="h-7 px-2"
                      >
                        <AlignLeft className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleElementUpdate({ textAlign: 'center' })}
                        className="h-7 px-2"
                      >
                        <AlignCenter className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleElementUpdate({ textAlign: 'right' })}
                        className="h-7 px-2"
                      >
                        <AlignRight className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={selectedElement.textAlign === 'justify' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleElementUpdate({ textAlign: 'justify' })}
                        className="h-7 px-2"
                      >
                        <AlignJustify className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Color and Font Size */}
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

                    {/* Font Family */}
                    <Select
                      value={selectedElement.fontFamily || 'Arial'}
                      onValueChange={(value) => handleElementUpdate({ fontFamily: value })}
                    >
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue placeholder="Font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Verdana">Verdana</SelectItem>
                        <SelectItem value="Courier New">Courier</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Background Color */}
                    <div className="flex items-center gap-1">
                      <Label className="text-xs">BG:</Label>
                      <Input
                        type="color"
                        value={selectedElement.backgroundColor || '#ffffff'}
                        onChange={(e) => handleElementUpdate({ backgroundColor: e.target.value })}
                        className="w-8 h-7 p-0 border-0"
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
