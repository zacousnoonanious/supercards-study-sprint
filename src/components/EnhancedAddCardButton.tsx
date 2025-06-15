
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CardTemplate } from '@/types/flashcard';
import { cardTemplates } from '@/data/cardTemplates';
import { useI18n } from '@/contexts/I18nContext';

interface EnhancedAddCardButtonProps {
  onCreateCard: () => void;
  onCreateFromTemplate: (template: CardTemplate) => void;
  showText?: boolean;
}

export const EnhancedAddCardButton: React.FC<EnhancedAddCardButtonProps> = ({
  onCreateCard,
  onCreateFromTemplate,
  showText = false,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useI18n();

  // Load saved template preference
  useEffect(() => {
    const savedTemplateId = localStorage.getItem('lastSelectedTemplate');
    if (savedTemplateId) {
      const template = cardTemplates.find(t => t.id === savedTemplateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, []);

  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      setDropdownOpen(true);
    }, 500); // 500ms long press
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (!isLongPress) {
      // Short press - use selected template or create blank card
      if (selectedTemplate) {
        onCreateFromTemplate(selectedTemplate);
      } else {
        onCreateCard();
      }
    }
    
    setIsLongPress(false);
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPress(false);
  };

  const handleTemplateSelect = (template: CardTemplate) => {
    setSelectedTemplate(template);
    localStorage.setItem('lastSelectedTemplate', template.id);
    onCreateFromTemplate(template);
    setDropdownOpen(false);
  };

  const handleBlankCard = () => {
    setSelectedTemplate(null);
    localStorage.removeItem('lastSelectedTemplate');
    onCreateCard();
    setDropdownOpen(false);
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`relative ${showText ? 'justify-start' : 'aspect-square p-0'} transition-colors`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
        >
          <Plus className="w-4 h-4" />
          {showText && (
            <span className="ml-2">
              {selectedTemplate ? selectedTemplate.name : t('editor.newCard')}
            </span>
          )}
          <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuItem onClick={handleBlankCard}>
          <Plus className="w-4 h-4 mr-2" />
          {t('editor.blankCard')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {cardTemplates.map((template) => (
          <DropdownMenuItem 
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="flex flex-col items-start gap-1"
          >
            <div className="flex items-center gap-2 w-full">
              <span className="font-medium">{template.name}</span>
              {selectedTemplate?.id === template.id && (
                <span className="text-xs bg-primary text-primary-foreground px-1 rounded ml-auto">
                  {t('common.current')}
                </span>
              )}
            </div>
            {template.description && (
              <span className="text-xs text-muted-foreground">{template.description}</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">
          {t('editor.longPressToChoose')}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
