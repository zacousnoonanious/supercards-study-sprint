
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
  Undo, 
  Redo, 
  Palette,
  Image,
  Grid,
  Settings
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
}) => {
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
        <ContextMenuItem onClick={onChangeBackground}>
          <Palette className="w-4 h-4 mr-2" />
          Change Background Color
        </ContextMenuItem>
        <ContextMenuItem onClick={() => {}}>
          <Image className="w-4 h-4 mr-2" />
          Background Image
        </ContextMenuItem>
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
