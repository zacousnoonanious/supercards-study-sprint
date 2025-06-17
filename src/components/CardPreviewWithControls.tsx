
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Play, Trash2 } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { StudyCardRenderer } from './StudyCardRenderer';
import { DragHandle } from './DragHandle';
import { useNavigate } from 'react-router-dom';

interface CardPreviewWithControlsProps {
  card: Flashcard;
  cardIndex: number;
  onClick: () => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onStudyFromCard?: (cardIndex: number) => void;
  onDeleteCard?: (cardId: string) => void;
}

export const CardPreviewWithControls: React.FC<CardPreviewWithControlsProps> = ({
  card,
  cardIndex,
  onClick,
  isDragging = false,
  onDragStart = () => {},
  onDragEnd = () => {},
  onStudyFromCard,
  onDeleteCard
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const navigate = useNavigate();

  const currentElements = showAnswer ? card.back_elements : card.front_elements;
  const cardWidth = card.canvas_width || 600;
  const cardHeight = card.canvas_height || 450;
  
  // Fixed preview dimensions for consistency
  const fixedPreviewWidth = 280;
  const fixedPreviewHeight = 210;
  
  // Calculate scale to fit the card content within fixed preview size
  const scaleX = fixedPreviewWidth / cardWidth;
  const scaleY = fixedPreviewHeight / cardHeight;
  const scale = Math.min(scaleX, scaleY);

  const handleDragStart = (e: React.DragEvent) => {
    console.log('CardPreview: Starting drag for card', cardIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardIndex.toString());
    e.dataTransfer.setData('application/json', JSON.stringify({ cardIndex, cardId: card.id }));
    
    // Create a custom drag image
    const dragElement = e.currentTarget as HTMLElement;
    const rect = dragElement.getBoundingClientRect();
    e.dataTransfer.setDragImage(dragElement, rect.width / 2, rect.height / 2);
    
    onDragStart(e);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('CardPreview: Ending drag for card', cardIndex);
    onDragEnd(e);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only handle click if not dragging and not clicking on buttons
    if (!isDragging && !(e.target as HTMLElement).closest('button')) {
      onClick();
    }
  };

  return (
    <Card 
      className={`group relative hover:shadow-lg transition-all duration-300 h-full flex flex-col ${
        isDragging ? 'shadow-2xl scale-105 rotate-2 z-50 opacity-80' : 'hover:scale-[1.02]'
      }`}
      style={{
        transform: isDragging ? 'rotate(3deg) scale(1.05)' : undefined,
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: isDragging ? 'none' : 'auto',
      }}
      onClick={handleCardClick}
    >
      <DragHandle
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        isDragging={isDragging}
      />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Card {cardIndex + 1}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1 flex flex-col">
        {/* Card Preview - Fixed size container */}
        <div 
          className="border rounded overflow-hidden cursor-pointer bg-white flex items-center justify-center"
          style={{ 
            width: fixedPreviewWidth, 
            height: fixedPreviewHeight 
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowAnswer(!showAnswer);
          }}
        >
          <div 
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              width: cardWidth,
              height: cardHeight
            }}
          >
            <StudyCardRenderer
              elements={currentElements}
              textScale={scale}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              className="w-full h-full"
            />
          </div>
        </div>
        
        {/* Card Info */}
        <div className="text-xs text-muted-foreground flex-1">
          <p>Dimensions: {cardWidth} × {cardHeight}px</p>
          <p>Front: {card.front_elements?.length || 0} elements</p>
          <p>Back: {card.back_elements?.length || 0} elements</p>
          {card.card_type && card.card_type !== 'normal' && (
            <p className="capitalize">Type: {card.card_type}</p>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit/${card.set_id}/${card.id}`);
            }}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          
          {onStudyFromCard && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStudyFromCard(cardIndex);
              }}
              className="flex-1"
            >
              <Play className="w-3 h-3 mr-1" />
              Study
            </Button>
          )}
          
          {onDeleteCard && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCard(card.id);
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
      
      {/* Dragging overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <div className="text-primary font-medium bg-white/90 px-3 py-1 rounded-md shadow-lg">
            Moving Card {cardIndex + 1}...
          </div>
        </div>
      )}
    </Card>
  );
};
