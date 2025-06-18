
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, ChevronDown, LayoutTemplate } from 'lucide-react';
import { CardTemplate } from '@/types/flashcard';
import { NewCardTemplateSelector } from './NewCardTemplateSelector';
import { TemplateSelector } from './TemplateSelector';

interface EnhancedAddCardButtonProps {
  onCreateCard: () => void;
  onCreateFromTemplate: (template: CardTemplate) => void;
  showText?: boolean;
}

export const EnhancedAddCardButton: React.FC<EnhancedAddCardButtonProps> = ({
  onCreateCard,
  onCreateFromTemplate,
  showText = true,
}) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleTemplateSelect = (template: CardTemplate) => {
    onCreateFromTemplate(template);
    setShowTemplateSelector(false);
  };

  if (showText) {
    return (
      <>
        <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="justify-between h-6 w-full"
            >
              <div className="flex items-center">
                <Plus className="w-2.5 h-2.5 mr-1" />
                <span className="text-xs">Add Card</span>
              </div>
              <ChevronDown className="w-2.5 h-2.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => {
              onCreateCard();
              setShowDropdown(false);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Blank Card
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setShowTemplateSelector(true);
              setShowDropdown(false);
            }}>
              <LayoutTemplate className="w-4 h-4 mr-2" />
              From Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {showTemplateSelector && (
          <TemplateSelector
            onSelectTemplate={handleTemplateSelect}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
      </>
    );
  }

  // Compact icon-only version
  return (
    <>
      <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="aspect-square p-0 h-6 w-6"
          >
            <Plus className="w-2.5 h-2.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => {
            onCreateCard();
            setShowDropdown(false);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Blank Card
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setShowTemplateSelector(true);
            setShowDropdown(false);
          }}>
            <LayoutTemplate className="w-4 h-4 mr-2" />
            From Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </>
  );
};
