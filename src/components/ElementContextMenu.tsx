
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
  MoveUp, 
  MoveDown, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Trash2,
  RotateCw
} from 'lucide-react';

interface ElementContextMenuProps {
  children: React.ReactNode;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRotate: () => void;
}

export const ElementContextMenu: React.FC<ElementContextMenuProps> = ({
  children,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  onDuplicate,
  onDelete,
  onRotate,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onMoveToTop}>
          <ArrowUp className="w-4 h-4 mr-2" />
          Bring to Front
        </ContextMenuItem>
        <ContextMenuItem onClick={onMoveUp}>
          <MoveUp className="w-4 h-4 mr-2" />
          Bring Forward
        </ContextMenuItem>
        <ContextMenuItem onClick={onMoveDown}>
          <MoveDown className="w-4 h-4 mr-2" />
          Send Backward
        </ContextMenuItem>
        <ContextMenuItem onClick={onMoveToBottom}>
          <ArrowDown className="w-4 h-4 mr-2" />
          Send to Back
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onRotate}>
          <RotateCw className="w-4 h-4 mr-2" />
          Rotate 90°
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
