
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Type, Image, HelpCircle, CheckSquare, Youtube, Copy, Plus, Mic } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';

interface ElementToolbarProps {
  onAddElement: (type: 'text' | 'image' | 'multiple-choice' | 'true-false' | 'youtube' | 'deck-embed' | 'audio') => void;
  selectedElement: CanvasElement | null;
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
  onDeleteElement: () => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  onAddElement,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onCreateNewCard,
  onCreateNewCardWithLayout,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';

  return (
    <Card className={`${isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          Card Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Elements Section */}
        <div>
          <Label className={`text-sm font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
            Add Elements
          </Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button
              onClick={() => onAddElement('text')}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${isDarkTheme ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
            >
              <Type className="w-4 h-4" />
              Text
            </Button>
            <Button
              onClick={() => onAddElement('image')}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${isDarkTheme ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
            >
              <Image className="w-4 h-4" />
              Image
            </Button>
            <Button
              onClick={() => onAddElement('multiple-choice')}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${isDarkTheme ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
            >
              <HelpCircle className="w-4 h-4" />
              Quiz
            </Button>
            <Button
              onClick={() => onAddElement('true-false')}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${isDarkTheme ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
            >
              <CheckSquare className="w-4 h-4" />
              T/F
            </Button>
            <Button
              onClick={() => onAddElement('youtube')}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${isDarkTheme ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
            >
              <Youtube className="w-4 h-4" />
              Video
            </Button>
            <Button
              onClick={() => onAddElement('audio')}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${isDarkTheme ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
            >
              <Mic className="w-4 h-4" />
              Audio
            </Button>
          </div>
        </div>

        <Separator className={isDarkTheme ? 'bg-gray-600' : ''} />

        {/* Card Actions */}
        <div>
          <Label className={`text-sm font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
            Card Actions
          </Label>
          <div className="space-y-2 mt-2">
            <Button
              onClick={onCreateNewCard}
              variant="outline"
              size="sm"
              className={`w-full flex items-center gap-2 ${isDarkTheme ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
            >
              <Plus className="w-4 h-4" />
              New Card
            </Button>
            <Button
              onClick={onCreateNewCardWithLayout}
              variant="outline"
              size="sm"
              className={`w-full flex items-center gap-2 ${isDarkTheme ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
            >
              <Copy className="w-4 h-4" />
              Copy Layout
            </Button>
          </div>
        </div>

        {/* Element Properties */}
        {selectedElement && (
          <>
            <Separator className={isDarkTheme ? 'bg-gray-600' : ''} />
            <div>
              <Label className={`text-sm font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                Element Properties
              </Label>
              <div className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>X</Label>
                    <Input
                      type="number"
                      value={selectedElement.x}
                      onChange={(e) => onUpdateElement({ x: parseInt(e.target.value) })}
                      className={`h-8 text-xs ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>Y</Label>
                    <Input
                      type="number"
                      value={selectedElement.y}
                      onChange={(e) => onUpdateElement({ y: parseInt(e.target.value) })}
                      className={`h-8 text-xs ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>Width</Label>
                    <Input
                      type="number"
                      value={selectedElement.width}
                      onChange={(e) => onUpdateElement({ width: parseInt(e.target.value) })}
                      className={`h-8 text-xs ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>Height</Label>
                    <Input
                      type="number"
                      value={selectedElement.height}
                      onChange={(e) => onUpdateElement({ height: parseInt(e.target.value) })}
                      className={`h-8 text-xs ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                </div>
                <div>
                  <Label className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>Rotation</Label>
                  <Input
                    type="number"
                    value={selectedElement.rotation}
                    onChange={(e) => onUpdateElement({ rotation: parseInt(e.target.value) })}
                    className={`h-8 text-xs ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    min="-180"
                    max="180"
                  />
                </div>
                <Button
                  onClick={onDeleteElement}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  Delete Element
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
