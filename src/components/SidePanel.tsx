
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
        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Element Type</span>
              <span className="text-sm font-semibold capitalize">{selectedElement.type}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              ID: {selectedElement.id}
            </div>
          </div>
          
          <ElementOptionsPanel
            element={selectedElement}
            onUpdate={(updates) => onUpdateElement(selectedElement.id, updates)}
            onDelete={() => onDeleteElement(selectedElement.id)}
          />
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="font-medium">No element selected</p>
            <p className="text-sm">Click on an element to view and edit its properties</p>
          </div>
        </div>
      )}
    </div>
  );
};
