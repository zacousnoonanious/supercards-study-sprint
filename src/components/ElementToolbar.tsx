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
  MoreHorizontal,
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
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

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
      <div className="grid grid-cols-2 gap-2">
        {elementTypes.slice(0, isExpanded ? elementTypes.length : 4).map((item) => (
          <Button
            key={item.type}
            variant="outline"
            className="w-full h-12 flex-col justify-center"
            onClick={() => onAddElement(item.type)}
          >
            <item.icon className="h-4 w-4 mb-1" />
            <span>{item.label}</span>
          </Button>
        ))}
        {elementTypes.length > 4 && (
          <Button variant="ghost" className="w-full h-12 flex-col justify-center" onClick={toggleExpanded}>
            <MoreHorizontal className="h-4 w-4 mb-1" />
            <span>{isExpanded ? 'Less' : 'More'}</span>
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full">
            Card Actions <GripVertical className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onClick={onCreateNewCard}>Create New Card</DropdownMenuItem>
          <DropdownMenuItem onClick={onCreateNewCardWithLayout}>Duplicate Card Layout</DropdownMenuItem>
          <DropdownMenuSeparator />
          {selectedElement && (
            <>
              <DropdownMenuItem onClick={onDeleteElement}>Delete Element</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
