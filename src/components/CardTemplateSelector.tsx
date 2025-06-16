
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, LayoutTemplate } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CardTemplate } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';

interface CardTemplateSelectorProps {
  onCreateCard: () => void;
  onCreateFromTemplate: (template: CardTemplate) => void;
  onSetDefaultTemplate: (template: CardTemplate) => void;
  defaultTemplate?: CardTemplate;
  onBrowseTemplates?: () => void;
}

export const CardTemplateSelector: React.FC<CardTemplateSelectorProps> = ({
  onCreateCard,
  onCreateFromTemplate,
  onSetDefaultTemplate,
  defaultTemplate,
  onBrowseTemplates,
}) => {
  const { t } = useI18n();
  const [templates] = useState<CardTemplate[]>([
    {
      id: 'simple-text',
      name: 'Simple Text Card',
      description: 'Basic front and back text card',
      card_type: 'normal',
      canvas_width: 600,
      canvas_height: 450,
      allowedElementTypes: ['text', 'image', 'audio', 'tts'],
      autoAdvanceOnAnswer: false,
      showBackSide: true,
      restrictedToolbar: false,
      front_elements: [
        {
          id: 'front-text',
          type: 'text',
          x: 50,
          y: 200,
          width: 500,
          height: 50,
          zIndex: 1,
          content: 'Question goes here',
          fontSize: 24,
          textAlign: 'center'
        }
      ],
      back_elements: [
        {
          id: 'back-text',
          type: 'text',
          x: 50,
          y: 200,
          width: 500,
          height: 50,
          zIndex: 1,
          content: 'Answer goes here',
          fontSize: 24,
          textAlign: 'center'
        }
      ]
    },
    {
      id: 'quiz-multiple-choice',
      name: 'Multiple Choice Quiz',
      description: 'Quiz card with multiple choice questions',
      card_type: 'quiz-only',
      canvas_width: 600,
      canvas_height: 450,
      allowedElementTypes: ['multiple-choice'],
      autoAdvanceOnAnswer: true,
      showBackSide: false,
      restrictedToolbar: true,
      front_elements: [
        {
          id: 'mc-quiz',
          type: 'multiple-choice',
          x: 50,
          y: 50,
          width: 500,
          height: 350,
          zIndex: 1,
          content: 'What is the correct answer?',
          multipleChoiceOptions: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          showImmediateFeedback: true,
          autoAdvanceOnAnswer: false
        }
      ],
      back_elements: []
    },
    {
      id: 'quiz-true-false',
      name: 'True/False Quiz',
      description: 'Quiz card with true/false questions',
      card_type: 'quiz-only',
      canvas_width: 600,
      canvas_height: 450,
      allowedElementTypes: ['true-false'],
      autoAdvanceOnAnswer: true,
      showBackSide: false,
      restrictedToolbar: true,
      front_elements: [
        {
          id: 'tf-quiz',
          type: 'true-false',
          x: 50,
          y: 50,
          width: 500,
          height: 300,
          zIndex: 1,
          content: 'This statement is true.',
          correctAnswer: 1,
          showImmediateFeedback: true,
          autoAdvanceOnAnswer: false
        }
      ],
      back_elements: []
    },
    {
      id: 'informational',
      name: 'Informational Card',
      description: 'Single-sided informational card',
      card_type: 'informational',
      canvas_width: 600,
      canvas_height: 450,
      allowedElementTypes: ['text', 'image'],
      autoAdvanceOnAnswer: false,
      showBackSide: false,
      restrictedToolbar: false,
      front_elements: [
        {
          id: 'info-text',
          type: 'text',
          x: 50,
          y: 50,
          width: 500,
          height: 350,
          zIndex: 1,
          content: 'This is informational content that doesn\'t require an answer.',
          fontSize: 18,
          textAlign: 'left'
        }
      ],
      back_elements: []
    }
  ]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuItem onClick={onCreateCard}>
          <Plus className="w-4 h-4 mr-2" />
          {t('editor.blankCard')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {templates.map((template) => (
          <DropdownMenuItem 
            key={template.id}
            onClick={() => onCreateFromTemplate(template)}
            className="flex flex-col items-start gap-1"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{template.name}</span>
              {defaultTemplate?.id === template.id && (
                <span className="text-xs bg-primary text-primary-foreground px-1 rounded">{t('common.default')}</span>
              )}
            </div>
            {template.description && (
              <span className="text-xs text-muted-foreground">{template.description}</span>
            )}
          </DropdownMenuItem>
        ))}
        {onBrowseTemplates && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onBrowseTemplates}>
              <LayoutTemplate className="w-4 h-4 mr-2" />
              {t('common.browseLibrary')}
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
          {t('editor.rightClickToSetDefault')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
