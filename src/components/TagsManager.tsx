
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tags, X, Sparkles, User } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';

interface TagsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentCard: Flashcard;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
}

export const TagsManager: React.FC<TagsManagerProps> = ({
  isOpen,
  onClose,
  currentCard,
  onUpdateCard,
}) => {
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize tags from card metadata
  useEffect(() => {
    if (currentCard?.metadata) {
      const cardTags = currentCard.metadata.tags || [];
      const cardAiTags = currentCard.metadata.aiTags || [];
      setTags(cardTags);
      setAiTags(cardAiTags);
    }
  }, [currentCard]);

  const handleAddTag = (tagText: string) => {
    const trimmedTag = tagText.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && !aiTags.includes(trimmedTag)) {
      const updatedTags = [...tags, trimmedTag];
      setTags(updatedTags);
      updateCardTags(updatedTags, aiTags);
      setNewTag('');
      
      toast({
        title: "Tag added",
        description: `"${trimmedTag}" has been added to your card.`,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      if (newTag.trim()) {
        handleAddTag(newTag);
      }
    }
  };

  const removeTag = (tagToRemove: string, isAi: boolean) => {
    if (isAi) {
      const updatedAiTags = aiTags.filter(tag => tag !== tagToRemove);
      setAiTags(updatedAiTags);
      updateCardTags(tags, updatedAiTags);
    } else {
      const updatedTags = tags.filter(tag => tag !== tagToRemove);
      setTags(updatedTags);
      updateCardTags(updatedTags, aiTags);
    }
    
    toast({
      title: "Tag removed",
      description: `"${tagToRemove}" has been removed from your card.`,
    });
  };

  const updateCardTags = (manualTags: string[], aiGeneratedTags: string[]) => {
    const updatedMetadata = {
      ...currentCard.metadata,
      tags: manualTags,
      aiTags: aiGeneratedTags,
    };
    
    onUpdateCard({ metadata: updatedMetadata });
  };

  const handleGenerateAiTags = () => {
    // Mock AI tag generation based on card content
    const questionText = currentCard.question?.toLowerCase() || '';
    const answerText = currentCard.answer?.toLowerCase() || '';
    const contentText = `${questionText} ${answerText}`;
    
    const suggestedTags: string[] = [];
    
    // Simple keyword detection
    if (contentText.includes('math') || contentText.includes('equation') || contentText.includes('calculate')) {
      suggestedTags.push('Mathematics');
    }
    if (contentText.includes('science') || contentText.includes('biology') || contentText.includes('chemistry')) {
      suggestedTags.push('Science');
    }
    if (contentText.includes('history') || contentText.includes('war') || contentText.includes('president')) {
      suggestedTags.push('History');
    }
    if (contentText.includes('language') || contentText.includes('grammar') || contentText.includes('verb')) {
      suggestedTags.push('Language');
    }
    
    // Filter out existing tags
    const newAiTags = suggestedTags.filter(tag => 
      !tags.includes(tag) && !aiTags.includes(tag)
    );
    
    if (newAiTags.length > 0) {
      const updatedAiTags = [...aiTags, ...newAiTags];
      setAiTags(updatedAiTags);
      updateCardTags(tags, updatedAiTags);
      
      toast({
        title: "AI tags generated",
        description: `Added ${newAiTags.length} new AI-generated tag(s).`,
      });
    } else {
      toast({
        title: "No new tags found",
        description: "AI couldn't find any new relevant tags for this card.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Manage Card Tags
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add new tag input */}
          <div className="space-y-2">
            <Label htmlFor="new-tag">Add New Tag</Label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                id="new-tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type and press Space, Tab, or Enter"
                className="flex-1"
              />
              <Button 
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag.trim()}
                size="sm"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Space, Tab, or Enter to add tags quickly
            </p>
          </div>

          {/* AI Tag Generation */}
          <div className="space-y-2">
            <Button
              onClick={handleGenerateAiTags}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Tags
            </Button>
          </div>

          {/* Manual Tags */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Manual Tags ({tags.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag, false)}
                      className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Generated Tags */}
          {aiTags.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Generated Tags ({aiTags.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {aiTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag, true)}
                      className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {tags.length === 0 && aiTags.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Tags className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tags added yet</p>
              <p className="text-sm">Add tags to help organize and find your cards</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
