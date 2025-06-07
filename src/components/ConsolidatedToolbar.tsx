
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Type,
  Image,
  Volume2,
  Pencil,
  CheckSquare,
  ToggleLeft,
  Youtube,
  Layers,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  RotateCw,
  Grid3X3,
  AlignCenter,
  Trash2,
  Settings,
  Copy,
  FileImage,
} from 'lucide-react';
import { Flashcard, CardTemplate } from '@/types/flashcard';
import { TemplateSelector } from '@/components/TemplateSelector';

interface ConsolidatedToolbarProps {
  onAddElement: (type: string) => void;
  onAutoArrange: (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'center-horizontal' | 'center-vertical') => void;
  currentCard: Flashcard;
  currentCardIndex: number;
  totalCards: number;
  currentSide: 'front' | 'back';
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onCreateNewCardFromTemplate: (template: CardTemplate) => void;
  onDeleteCard: () => void;
  onCardTypeChange: (type: string) => void;
  position?: 'left' | 'top' | 'right' | 'bottom';
  onPositionChange?: (position: 'left' | 'top' | 'right' | 'bottom') => void;
}

export const ConsolidatedToolbar: React.FC<ConsolidatedToolbarProps> = ({
  onAddElement,
  onAutoArrange,
  currentCard,
  currentCardIndex,
  totalCards,
  currentSide,
  onNavigateCard,
  onSideChange,
  onCreateNewCard,
  onCreateNewCardWithLayout,
  onCreateNewCardFromTemplate,
  onDeleteCard,
  onCardTypeChange,
  position = "left",
}) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const buttonSizeClass = "w-12 h-10";
  const separatorClass = "w-full h-px bg-border";

  const handleCreateFromTemplate = (template: CardTemplate) => {
    onCreateNewCardFromTemplate(template);
    setShowTemplateSelector(false);
  };

  return (
    <div className="bg-background border-r rounded-l-lg shadow-lg p-2 gap-2 flex flex-col w-16">
      {/* Side Toggle */}
      <div className="flex flex-col gap-1">
        <Button
          variant={currentSide === 'front' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSideChange('front')}
          className="w-12 h-8 p-0 text-xs"
        >
          Front
        </Button>
        <Button
          variant={currentSide === 'back' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSideChange('back')}
          className="w-12 h-8 p-0 text-xs"
        >
          Back
        </Button>
      </div>

      <div className={separatorClass} />

      {/* Add Elements */}
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('text')}
          className={`${buttonSizeClass} p-0`}
          title="Add Text"
        >
          <Type className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('image')}
          className={`${buttonSizeClass} p-0`}
          title="Add Image"
        >
          <Image className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('audio')}
          className={`${buttonSizeClass} p-0`}
          title="Add Audio"
        >
          <Volume2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('multiple-choice')}
          className={`${buttonSizeClass} p-0`}
          title="Multiple Choice"
        >
          <CheckSquare className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('youtube')}
          className={`${buttonSizeClass} p-0`}
          title="Add YouTube Video"
        >
          <Youtube className="w-4 h-4" />
        </Button>
      </div>

      <div className={separatorClass} />

      {/* Quick Actions */}
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAutoArrange('grid')}
          className={`${buttonSizeClass} p-0`}
          title="Grid Layout"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAutoArrange('center-horizontal')}
          className={`${buttonSizeClass} p-0`}
          title="Center Horizontally"
        >
          <AlignCenter className="w-4 h-4 rotate-0" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAutoArrange('center-vertical')}
          className={`${buttonSizeClass} p-0`}
          title="Center Vertically"
        >
          <AlignCenter className="w-4 h-4 rotate-90" />
        </Button>
      </div>

      <div className={separatorClass} />

      {/* Card Actions - Icons Only */}
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`${buttonSizeClass} p-0`}
          onClick={onCreateNewCard}
          title="New Card"
        >
          <Plus className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`${buttonSizeClass} p-0`}
          onClick={onCreateNewCardWithLayout}
          title="Copy Layout"
        >
          <Copy className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`${buttonSizeClass} p-0`}
          onClick={() => setShowTemplateSelector(true)}
          title="Templates"
        >
          <FileImage className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteCard}
          className={`${buttonSizeClass} p-0 text-destructive hover:text-destructive`}
          title="Delete Card"
          disabled={totalCards <= 1}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleCreateFromTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
};
