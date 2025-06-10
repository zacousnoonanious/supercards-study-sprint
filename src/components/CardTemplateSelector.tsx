
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CardTemplate } from '@/types/flashcard';

interface CardTemplateSelectorProps {
  onCreateCard: () => void;
  onCreateFromTemplate: (template: CardTemplate) => void;
  onSetDefaultTemplate: (template: CardTemplate) => void;
  defaultTemplate?: CardTemplate;
}

export const CardTemplateSelector: React.FC<CardTemplateSelectorProps> = ({
  onCreateCard,
  onCreateFromTemplate,
  onSetDefaultTemplate,
  defaultTemplate
}) => {
  const [templates] = useState<CardTemplate[]>([
    {
      id: 'simple-text',
      name: 'Simple Text Card',
      description: 'Basic front and back text card',
      image: '/placeholder.svg',
      card_type: 'normal',
      canvas_width: 600,
      canvas_height: 450,
      front_elements: [
        {
          id: 'front-text',
          type: 'text',
          x: 50,
          y: 200,
          width: 500,
          height: 50,
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
      image: '/placeholder.svg',
      card_type: 'quiz-only',
      canvas_width: 600,
      canvas_height: 450,
      front_elements: [
        {
          id: 'mc-quiz',
          type: 'multiple-choice',
          x: 50,
          y: 50,
          width: 500,
          height: 350,
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
      image: '/placeholder.svg',
      card_type: 'quiz-only',
      canvas_width: 600,
      canvas_height: 450,
      front_elements: [
        {
          id: 'tf-quiz',
          type: 'true-false',
          x: 50,
          y: 50,
          width: 500,
          height: 300,
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
      image: '/placeholder.svg',
      card_type: 'informational',
      canvas_width: 600,
      canvas_height: 450,
      front_elements: [
        {
          id: 'info-text',
          type: 'text',
          x: 50,
          y: 50,
          width: 500,
          height: 350,
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
          Blank Card
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
                <span className="text-xs bg-primary text-primary-foreground px-1 rounded">Default</span>
              )}
            </div>
            {template.description && (
              <span className="text-xs text-muted-foreground">{template.description}</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
          Right-click any template to set as default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
