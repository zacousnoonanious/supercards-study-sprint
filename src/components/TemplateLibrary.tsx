
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardTemplate } from '@/types/flashcard';
import { cardTemplates } from '@/data/cardTemplates';
import { useI18n } from '@/contexts/I18nContext';
import { Type, Image, CheckSquare, ToggleLeft, FileText, Youtube, Layers, Volume2, Pencil, Search, Filter, SortAsc } from 'lucide-react';

interface TemplateLibraryProps {
  onSelectTemplate: (template: CardTemplate) => void;
  onClose: () => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onSelectTemplate,
  onClose
}) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size'>('name');
  const [filterType, setFilterType] = useState<string>('all');

  const getElementIcon = (elementType: string) => {
    switch (elementType) {
      case 'text': return <Type className="w-3 h-3" />;
      case 'image': return <Image className="w-3 h-3" />;
      case 'multiple-choice': return <CheckSquare className="w-3 h-3" />;
      case 'true-false': return <ToggleLeft className="w-3 h-3" />;
      case 'fill-in-blank': return <FileText className="w-3 h-3" />;
      case 'youtube': return <Youtube className="w-3 h-3" />;
      case 'deck-embed': return <Layers className="w-3 h-3" />;
      case 'audio': return <Volume2 className="w-3 h-3" />;
      case 'drawing': return <Pencil className="w-3 h-3" />;
      default: return <Type className="w-3 h-3" />;
    }
  };

  const getCardTypeColor = (cardType: string) => {
    switch (cardType) {
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'simple': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'informational': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'single-sided': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getAllowedElements = (template: CardTemplate) => {
    const allElements = [...template.front_elements, ...(template.back_elements || [])];
    const elementTypes = [...new Set(allElements.map(el => el.type))];
    return elementTypes;
  };

  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = cardTemplates;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.card_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by card type
    if (filterType !== 'all') {
      filtered = filtered.filter(template => template.card_type === filterType);
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.card_type.localeCompare(b.card_type);
        case 'size':
          return (a.canvas_width * a.canvas_height) - (b.canvas_width * b.canvas_height);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, sortBy, filterType]);

  const uniqueCardTypes = [...new Set(cardTemplates.map(t => t.card_type))];

  const renderTemplatePreview = (template: CardTemplate) => {
    const frontElements = template.front_elements;
    const aspectRatio = template.canvas_width / template.canvas_height;
    const previewWidth = 160;
    const previewHeight = previewWidth / aspectRatio;
    const scaleX = previewWidth / template.canvas_width;
    const scaleY = previewHeight / template.canvas_height;
    
    return (
      <div 
        className="bg-gray-50 dark:bg-gray-800 rounded border-2 border-dashed border-gray-200 dark:border-gray-600 relative overflow-hidden"
        style={{ 
          width: previewWidth, 
          height: Math.min(previewHeight, 200),
          minHeight: '100px'
        }}
      >
        {frontElements.map((element, index) => {
          const elementX = element.x * scaleX;
          const elementY = element.y * scaleY;
          const elementWidth = Math.max(element.width * scaleX, 16);
          const elementHeight = Math.max(element.height * scaleY, 10);
          
          return (
            <div
              key={index}
              className="absolute flex items-center justify-center text-xs bg-white/90 dark:bg-gray-700/90 border border-gray-300 dark:border-gray-500 rounded"
              style={{
                left: Math.min(elementX, previewWidth - elementWidth),
                top: Math.min(elementY, previewHeight - elementHeight),
                width: elementWidth,
                height: elementHeight,
                fontSize: Math.max(6, elementWidth / 20)
              }}
            >
              <div className="flex items-center gap-0.5">
                {getElementIcon(element.type)}
                <span className="truncate">
                  {element.type === 'text' ? (
                    element.content?.length > 6 ? element.content.substring(0, 6) + '...' : (element.content || 'Text')
                  ) : element.type === 'image' ? 'Img'
                  : element.type === 'multiple-choice' ? 'MC'
                  : element.type === 'true-false' ? 'T/F'
                  : element.type === 'fill-in-blank' ? 'Fill'
                  : element.type.substring(0, 4)}
                </span>
              </div>
            </div>
          );
        })}
        
        {frontElements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
            Empty
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] mx-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{t('editor.templateLibrary')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Browse and select from our collection of card templates
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t('editor.searchTemplates')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(value: 'name' | 'type' | 'size') => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t('editor.sortByName')}</SelectItem>
                <SelectItem value="type">{t('editor.sortByType')}</SelectItem>
                <SelectItem value="size">{t('editor.sortBySize')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('editor.allCardTypes')}</SelectItem>
                {uniqueCardTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Templates Grid */}
          <ScrollArea className="h-[60vh]">
            {filteredAndSortedTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <Search className="w-12 h-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('editor.noTemplatesFound')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedTemplates.map((template) => {
                  const allowedElements = getAllowedElements(template);
                  
                  return (
                    <Card 
                      key={template.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary group"
                      onClick={() => onSelectTemplate(template)}
                    >
                      <CardContent className="p-4">
                        {/* Template Preview */}
                        <div className="flex justify-center mb-4">
                          {renderTemplatePreview(template)}
                        </div>
                        
                        {/* Template Info */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {template.description}
                            </p>
                          </div>
                          
                          {/* Card Type and Dimensions */}
                          <div className="flex justify-between items-center">
                            <Badge className={getCardTypeColor(template.card_type)}>
                              {template.card_type}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {template.canvas_width}×{template.canvas_height}
                            </span>
                          </div>

                          {/* Allowed Elements */}
                          <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {t('editor.allowedElements')}:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {allowedElements.slice(0, 4).map((elementType, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                                >
                                  {getElementIcon(elementType)}
                                  <span>{elementType}</span>
                                </div>
                              ))}
                              {allowedElements.length > 4 && (
                                <div className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                  +{allowedElements.length - 4} more
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Element Count */}
                          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>{template.front_elements.length} elements</span>
                            <Badge variant="outline" className="text-xs">
                              {template.front_elements.length === 0 ? t('editor.customizable') : t('editor.fixedLayout')}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
