
import React from 'react';
import { ElementOptionsPanel } from './settings/ElementOptionsPanel';
import { AIFeaturesPanel } from './ai/AIFeaturesPanel';
import { CanvasElement, Flashcard } from '@/types/flashcard';

interface SidePanelProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  currentCard: Flashcard;
  currentSide: 'front' | 'back';
  onTagsUpdate: (tags: string[]) => void;
  onCreateCard: (question: string, answer: string) => void;
  onApplyLayout: (elements: CanvasElement[]) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  currentCard,
  currentSide,
  onTagsUpdate,
  onCreateCard,
  onApplyLayout,
}) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Element Properties Panel - Shows when element is selected */}
        {selectedElement && (
          <ElementOptionsPanel
            element={selectedElement}
            onUpdateElement={(updates) => onUpdateElement(selectedElement.id, updates)}
            onDelete={() => onDeleteElement(selectedElement.id)}
          />
        )}

        {/* AI Features Panel - Always visible */}
        <AIFeaturesPanel
          currentCard={currentCard}
          currentSide={currentSide}
          selectedElement={selectedElement}
          onUpdateElement={onUpdateElement}
          onApplyLayout={onApplyLayout}
          onTagsUpdate={onTagsUpdate}
          onCreateCard={onCreateCard}
        />
      </div>
    </div>
  );
};
