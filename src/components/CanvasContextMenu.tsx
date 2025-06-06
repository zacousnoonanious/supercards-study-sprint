
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSub,
} from '@/components/ui/context-menu';
import { 
  Undo, 
  Redo, 
  Palette,
  Image,
  Grid,
  Settings,
  Maximize2,
  Minimize2,
  RotateCw,
  Move
} from 'lucide-react';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onChangeBackground: () => void;
  onToggleGrid: () => void;
  onSettings: () => void;
  onChangeCardSize?: (size: 'small' | 'medium' | 'large' | 'custom') => void;
  onScaleToElements?: () => void;
  onSetDefaultSize?: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  children,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onChangeBackground,
  onToggleGrid,
  onSettings,
  onChangeCardSize,
  onScaleToElements,
  onSetDefaultSize,
}) => {
  const backgroundColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Light Gray', value: '#f5f5f5' },
    { name: 'Blue', value: '#e3f2fd' },
    { name: 'Green', value: '#e8f5e8' },
    { name: 'Yellow', value: '#fff9c4' },
    { name: 'Pink', value: '#fce4ec' },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onUndo} disabled={!canUndo}>
          <Undo className="w-4 h-4 mr-2" />
          Undo
        </ContextMenuItem>
        <ContextMenuItem onClick={onRedo} disabled={!canRedo}>
          <Redo className="w-4 h-4 mr-2" />
          Redo
        </ContextMenuItem>
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Palette className="w-4 h-4 mr-2" />
            Background Color
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {backgroundColors.map((color) => (
              <ContextMenuItem 
                key={color.value}
                onClick={() => {
                  document.documentElement.style.setProperty('--canvas-bg', color.value);
                }}
                className="flex items-center justify-between"
              >
                <span>{color.name}</span>
                <div 
                  className="w-4 h-4 border border-gray-300 rounded"
                  style={{ backgroundColor: color.value }}
                />
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={() => {}}>
          <Image className="w-4 h-4 mr-2" />
          Background Image
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Maximize2 className="w-4 h-4 mr-2" />
            Card Size
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-40">
            <ContextMenuItem onClick={() => onChangeCardSize?.('small')}>
              Small (400x300)
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onChangeCardSize?.('medium')}>
              Medium (600x400)
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onChangeCardSize?.('large')}>
              Large (800x600)
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onScaleToElements}>
              <Move className="w-4 h-4 mr-2" />
              Scale to Elements
            </ContextMenuItem>
            <ContextMenuItem onClick={onSetDefaultSize}>
              <Settings className="w-4 h-4 mr-2" />
              Set as Default Size
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />
        <ContextMenuItem onClick={onToggleGrid}>
          <Grid className="w-4 h-4 mr-2" />
          Toggle Grid
        </ContextMenuItem>
        <ContextMenuItem onClick={onSettings}>
          <Settings className="w-4 h-4 mr-2" />
          Canvas Settings
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
