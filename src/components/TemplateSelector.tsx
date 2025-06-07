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
    
    // Calculate aspect ratio for the preview canvas
    const aspectRatio = template.canvas_width / template.canvas_height;
    const previewWidth = 200;
    const previewHeight = previewWidth / aspectRatio;
    
    // Scale factor for positioning elements in preview
    const scaleX = previewWidth / template.canvas_width;
    const scaleY = previewHeight / template.canvas_height;
    
    return (
      <div 
        className="bg-gray-50 rounded border-2 border-dashed border-gray-200 relative overflow-hidden"
        style={{ 
          width: previewWidth, 
          height: previewHeight,
          minHeight: '120px',
          maxHeight: '300px'
        }}
      >
        {/* Canvas dimension indicator */}
        <div className="absolute top-1 left-1 text-xs text-gray-500 bg-white/80 rounded px-1">
          {template.canvas_width}×{template.canvas_height}
        </div>
        
        {/* Element count indicator */}
        <div className="absolute top-1 right-1 text-xs text-gray-500 bg-white/80 rounded px-1">
          {frontElements.length} elements
        </div>
        
        {/* Render elements in their actual positions */}
        {frontElements.map((element, index) => {
          const elementX = element.x * scaleX;
          const elementY = element.y * scaleY;
          const elementWidth = Math.max(element.width * scaleX, 20);
          const elementHeight = Math.max(element.height * scaleY, 12);
          
          return (
            <div
              key={index}
              className="absolute flex items-center justify-center text-xs bg-white/90 border border-gray-300 rounded"
              style={{
                left: elementX,
                top: elementY,
                width: elementWidth,
                height: elementHeight,
                fontSize: Math.max(8, elementWidth / 15)
              }}
            >
              <div className="flex items-center gap-0.5">
                {getElementIcon(element.type)}
                <span className="truncate">
                  {element.type === 'text' ? (
                    element.content?.length > 8 ? element.content.substring(0, 8) + '...' : (element.content || 'Text')
                  ) : element.type === 'image' ? 'Img'
                  : element.type === 'multiple-choice' ? 'Quiz'
                  : element.type === 'true-false' ? 'T/F'
                  : element.type === 'fill-in-blank' ? 'Fill'
                  : element.type}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Layout description overlay */}
        <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-600 bg-white/90 rounded px-1 py-0.5">
          {frontElements.length === 0 ? 'Empty layout' :
           frontElements.length === 1 ? 'Single element' :
           frontElements.length === 2 ? 'Two elements' :
           frontElements.length <= 4 ? `${frontElements.length} elements` :
           `${frontElements.length} elements (dense)`}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-7xl max-h-[85vh] mx-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Choose a Template</h2>
              <p className="text-gray-600 mt-1">Select a pre-designed layout for your flashcard. Canvas sizes are shown to scale.</p>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {templates.map((template) => (
                      <Card 
                        key={template.id} 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary group"
                        onClick={() => onSelectTemplate(template)}
                      >
                        <CardContent className="p-4">
                          {/* Template Preview */}
                          <div className="flex justify-center mb-3">
                            {renderTemplatePreview(template)}
                          </div>
                          
                          {/* Template Info */}
                          <div>
                            <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
                              {template.description}
                            </p>
                            
                            <div className="flex justify-between items-center text-xs">
                              <Badge variant="outline" className="text-xs">
                                {template.card_type}
                              </Badge>
                              <span className="text-gray-500 font-mono">
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
