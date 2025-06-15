
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, X } from 'lucide-react';
import { CanvasElement, Flashcard } from '@/types/flashcard';

interface ElementLinkEditorProps {
  element: CanvasElement;
  availableCards: Flashcard[];
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onClose: () => void;
}

export const ElementLinkEditor: React.FC<ElementLinkEditorProps> = ({
  element,
  availableCards,
  onUpdateElement,
  onClose,
}) => {
  const [linkType, setLinkType] = useState(element.linkData?.type || 'none');
  const [targetCardId, setTargetCardId] = useState(element.linkData?.targetCardId || '');
  const [actionType, setActionType] = useState(element.linkData?.actionType || '');
  const [actionData, setActionData] = useState(element.linkData?.actionData || '');

  const handleSave = () => {
    if (linkType === 'none') {
      onUpdateElement(element.id, { linkData: null } as any);
    } else {
      const linkData = {
        type: linkType,
        ...(linkType === 'card-jump' && { targetCardId }),
        ...(linkType === 'action' && { actionType, actionData }),
      };
      onUpdateElement(element.id, { linkData } as any);
    }
    onClose();
  };

  return (
    <Card className="w-80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Link className="w-4 h-4" />
          Element Link Settings
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="link-type">Link Type</Label>
          <Select value={linkType} onValueChange={setLinkType}>
            <SelectTrigger>
              <SelectValue placeholder="Select link type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Link</SelectItem>
              <SelectItem value="card-jump">Jump to Card</SelectItem>
              <SelectItem value="action">Trigger Action</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {linkType === 'card-jump' && (
          <div className="space-y-2">
            <Label htmlFor="target-card">Target Card</Label>
            <Select value={targetCardId} onValueChange={setTargetCardId}>
              <SelectTrigger>
                <SelectValue placeholder="Select target card" />
              </SelectTrigger>
              <SelectContent>
                {availableCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.question.substring(0, 50)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {linkType === 'action' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="action-type">Action Type</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="play-audio">Play Audio</SelectItem>
                  <SelectItem value="show-hint">Show Hint</SelectItem>
                  <SelectItem value="reveal-answer">Reveal Answer</SelectItem>
                  <SelectItem value="embed-deck">Embed Deck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="action-data">Action Data</Label>
              <Input
                id="action-data"
                value={actionData}
                onChange={(e) => setActionData(e.target.value)}
                placeholder="Enter action data (URL, deck ID, etc.)"
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Link
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
