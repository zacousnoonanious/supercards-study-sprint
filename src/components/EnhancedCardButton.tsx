
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { CardTemplate } from '@/types/flashcard';
import { cardTemplates } from '@/data/cardTemplates';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface EnhancedCardButtonProps {
  onCreateCard: () => void;
  onCreateFromTemplate: (template: CardTemplate) => void;
  onSetDefaultTemplate: (template: CardTemplate) => void;
  defaultTemplate?: CardTemplate;
}

export const EnhancedCardButton: React.FC<EnhancedCardButtonProps> = ({
  onCreateCard,
  onCreateFromTemplate,
  onSetDefaultTemplate,
  defaultTemplate,
}) => {
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setShowTemplateMenu(true);
    }, 500); // Show menu after 500ms hold
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    
    if (!showTemplateMenu) {
      // Quick click - create default card or use default template
      if (defaultTemplate) {
        onCreateFromTemplate(defaultTemplate);
      } else {
        onCreateCard();
      }
    }
  };

  const handleMouseLeave = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  useEffect(() => {
    return () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
      }
    };
  }, [pressTimer]);

  return (
    <div className="flex items-center gap-1">
      <Button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-2 relative"
      >
        <Plus className="w-4 h-4" />
        Add Card
        {defaultTemplate && (
          <span className="text-xs opacity-70">({defaultTemplate.name})</span>
        )}
      </Button>

      <DropdownMenu open={showTemplateMenu} onOpenChange={setShowTemplateMenu}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="px-2">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem onClick={onCreateCard}>
            <Plus className="w-4 h-4 mr-2" />
            Blank Card
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {cardTemplates.map((template) => (
            <ContextMenu key={template.id}>
              <ContextMenuTrigger asChild>
                <DropdownMenuItem
                  onClick={() => onCreateFromTemplate(template)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded border bg-muted"
                    />
                    <span>{template.name}</span>
                  </div>
                  {defaultTemplate?.id === template.id && (
                    <span className="text-xs text-primary">Default</span>
                  )}
                </DropdownMenuItem>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => onSetDefaultTemplate(template)}>
                  Set as Default
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
