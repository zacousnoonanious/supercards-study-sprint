
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Type,
  Image,
  List,
  CheckSquare,
  Play,
  Layers,
  Volume2,
  Paintbrush,
  GripVertical,
  Plus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ElementToolbarProps {
  onAddElement: (type: string) => void;
  selectedElement: any;
  onUpdateElement: (updates: any) => void;
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
  const elementTypes = [
    { type: 'text' as const, icon: Type, label: 'Text' },
    { type: 'image' as const, icon: Image, label: 'Image' },
    { type: 'audio' as const, icon: Volume2, label: 'Audio' },
    { type: 'drawing' as const, icon: Paintbrush, label: 'Drawing' },
    { type: 'multiple-choice' as const, icon: List, label: 'Multiple Choice' },
    { type: 'true-false' as const, icon: CheckSquare, label: 'True/False' },
    { type: 'youtube' as const, icon: Play, label: 'YouTube' },
    { type: 'deck-embed' as const, icon: Layers, label: 'Deck Embed' },
  ];

  return (
    <div className="space-y-4">
      {/* Element Types - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2">
        {elementTypes.map((item) => (
          <Button
            key={item.type}
            variant="outline"
            className="w-full h-12 flex flex-col justify-center text-xs lg:text-sm"
            onClick={() => onAddElement(item.type)}
          >
            <item.icon className="h-3 w-3 lg:h-4 lg:w-4 mb-1" />
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{item.label.split(' ')[0]}</span>
          </Button>
        ))}
      </div>

      {/* Card Actions */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Card Actions</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-sm"
            onClick={onCreateNewCard}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Card
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-sm"
            onClick={onCreateNewCardWithLayout}
          >
            <Layers className="w-4 h-4 mr-2" />
            Duplicate Layout
          </Button>
          {selectedElement && (
            <Button
              variant="destructive"
              className="w-full justify-start text-sm"
              onClick={onDeleteElement}
            >
              Delete Element
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
