
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { ElementOptionsPanel } from './ElementOptionsPanel';

interface SidePanelProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}) => {
  const handleUpdate = (updates: Partial<CanvasElement>) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, updates);
    }
  };

  const handleDelete = () => {
    if (selectedElement) {
      onDeleteElement(selectedElement.id);
    }
  };

  return (
    <ElementOptionsPanel
      element={selectedElement}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
};
