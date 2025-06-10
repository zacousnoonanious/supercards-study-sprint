
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
  return (
    <div className="w-80 border-l bg-background p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      
      {selectedElement ? (
        <ElementOptionsPanel
          selectedElement={selectedElement}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
        />
      ) : (
        <div className="text-center text-muted-foreground py-8">
          <p>Select an element to view its properties</p>
        </div>
      )}
    </div>
  );
};
