
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CardTemplate } from '@/types/flashcard';
import { cardTemplates } from '@/data/cardTemplates';
import { Type, Image, CheckSquare, ToggleLeft, FileText, Youtube, Layers } from 'lucide-react';

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

  const getElementIcon = (elementType: string) => {
    switch (elementType) {
      case 'text': return <Type className="w-3 h-3" />;
      case 'image': return <Image className="w-3 h-3" />;
      case 'multiple-choice': return <CheckSquare className="w-3 h-3" />;
      case 'true-false': return <ToggleLeft className="w-3 h-3" />;
      case 'fill-in-blank': return <FileText className="w-3 h-3" />;
      case 'youtube': return <Youtube className="w-3 h-3" />;
      case 'deck-embed': return <Layers className="w-3 h-3" />;
      default: return <Type className="w-3 h-3" />;
    }
  };

  const renderTemplatePreview = (template: CardTemplate) => {
    const frontElements = template.front_elements;
    const elementTypes = [...new Set(frontElements.map(el => el.type))];
    
    return (
      <div className="aspect-[2/3] bg-gray-50 rounded border-2 border-dashed border-gray-200 p-2 flex flex-col justify-between">
        {/* Header with element count */}
        <div className="flex justify-between items-start text-xs text-gray-600">
          <span className="font-medium">Front</span>
          <span>{frontElements.length} elements</span>
        </div>
        
        {/* Visual layout representation */}
        <div className="flex-1 flex flex-col justify-center space-y-1">
          {frontElements.slice(0, 4).map((element, index) => (
            <div 
              key={index}
              className="flex items-center gap-1 text-xs text-gray-700 bg-white/80 rounded px-1 py-0.5"
            >
              {getElementIcon(element.type)}
              <span className="truncate">
                {element.type === 'text' ? (element.content?.substring(0, 15) + '...' || 'Text') 
                 : element.type === 'image' ? 'Image'
                 : element.type === 'multiple-choice' ? 'Quiz'
                 : element.type}
              </span>
            </div>
          ))}
          {frontElements.length > 4 && (
            <div className="text-xs text-gray-500 text-center">
              +{frontElements.length - 4} more
            </div>
          )}
        </div>
        
        {/* Bottom with element types */}
        <div className="flex flex-wrap gap-1 mt-1">
          {elementTypes.slice(0, 3).map((type, index) => (
            <div key={index} className="flex items-center gap-0.5 text-xs bg-blue-50 text-blue-700 rounded px-1">
              {getElementIcon(type)}
            </div>
          ))}
          {elementTypes.length > 3 && (
            <div className="text-xs text-gray-500">+{elementTypes.length - 3}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[85vh] mx-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Choose a Template</h2>
              <p className="text-gray-600 mt-1">Select a pre-designed layout for your flashcard</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          
          <ScrollArea className="h-[65vh]">
            <div className="space-y-8">
              {Object.entries(groupedTemplates).map(([cardType, templates]) => (
                <div key={cardType}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {getCardTypeLabel(cardType)}
                    <Badge className={getCardTypeBadgeColor(cardType)}>
                      {templates.length} template{templates.length !== 1 ? 's' : ''}
                    </Badge>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {templates.map((template) => (
                      <Card 
                        key={template.id} 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary group"
                        onClick={() => onSelectTemplate(template)}
                      >
                        <CardContent className="p-4">
                          {/* Template Preview */}
                          {renderTemplatePreview(template)}
                          
                          {/* Template Info */}
                          <div className="mt-3">
                            <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                              {template.description}
                            </p>
                            
                            <div className="mt-3 flex justify-between items-center">
                              <Badge variant="outline" className="text-xs">
                                {template.card_type}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {template.canvas_width}×{template.canvas_height}
                              </span>
                            </div>
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
