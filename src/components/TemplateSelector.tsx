
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CardTemplate } from '@/types/flashcard';
import { cardTemplates } from '@/data/cardTemplates';

interface TemplateSelectorProps {
  onSelectTemplate: (template: CardTemplate) => void;
  onClose: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  onClose
}) => {
  const groupedTemplates = cardTemplates.reduce((acc, template) => {
    if (!acc[template.card_type]) {
      acc[template.card_type] = [];
    }
    acc[template.card_type].push(template);
    return acc;
  }, {} as Record<string, CardTemplate[]>);

  const getCardTypeLabel = (cardType: string) => {
    switch (cardType) {
      case 'normal': return 'Normal Cards';
      case 'simple': return 'Simple Cards';
      case 'informational': return 'Informational Cards';
      default: return cardType;
    }
  };

  const getCardTypeBadgeColor = (cardType: string) => {
    switch (cardType) {
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'simple': return 'bg-green-100 text-green-800';
      case 'informational': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[80vh] mx-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Choose a Template</h2>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-8">
              {Object.entries(groupedTemplates).map(([cardType, templates]) => (
                <div key={cardType}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {getCardTypeLabel(cardType)}
                    <Badge className={getCardTypeBadgeColor(cardType)}>
                      {templates.length} template{templates.length !== 1 ? 's' : ''}
                    </Badge>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <Card 
                        key={template.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                        onClick={() => onSelectTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-[2/3] bg-gray-100 rounded mb-3 flex items-center justify-center relative overflow-hidden">
                            {template.thumbnail ? (
                              <img 
                                src={template.thumbnail} 
                                alt={template.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center p-2">
                                <div className="text-xs text-gray-500">
                                  {template.canvas_width} × {template.canvas_height}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {template.front_elements.length} element{template.front_elements.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {template.description}
                          </p>
                          
                          <div className="mt-2 flex justify-between items-center">
                            <Badge variant="outline" className="text-xs">
                              {template.card_type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {template.canvas_width}×{template.canvas_height}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
