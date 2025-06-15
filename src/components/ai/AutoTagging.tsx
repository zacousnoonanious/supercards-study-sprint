
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tags, Loader2, Plus, X } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';
import { useToast } from '@/components/ui/use-toast';

interface AutoTaggingProps {
  elements: CanvasElement[];
  currentTags: string[];
  onTagsUpdate: (tags: string[]) => void;
}

export const AutoTagging: React.FC<AutoTaggingProps> = ({
  elements,
  currentTags,
  onTagsUpdate,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const { toast } = useToast();

  const analyzeContentForTags = async () => {
    if (elements.length === 0) {
      toast({
        title: "No content to analyze",
        description: "Add some content to your card first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Extract all text content from elements
      const textContent = elements
        .filter(el => el.content)
        .map(el => el.content)
        .join(' ')
        .toLowerCase();

      // Simulate AI theme detection
      const detectedTags = detectThemes(textContent);
      
      // Filter out tags that already exist
      const newTags = detectedTags.filter(tag => !currentTags.includes(tag));
      
      setSuggestedTags(newTags);
      
      if (newTags.length === 0) {
        toast({
          title: "No new tags found",
          description: "All relevant themes are already tagged.",
        });
      } else {
        toast({
          title: "Tags suggested!",
          description: `Found ${newTags.length} new theme(s) in your content.`,
        });
      }

    } catch (error) {
      console.error('Auto-tagging error:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze content themes.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulate theme detection logic
  const detectThemes = (text: string): string[] => {
    const themes: string[] = [];
    
    // Science themes
    if (text.includes('photosynthesis') || text.includes('chlorophyll') || text.includes('plant')) {
      themes.push('Biology', 'Plants');
    }
    if (text.includes('atom') || text.includes('molecule') || text.includes('chemical')) {
      themes.push('Chemistry');
    }
    if (text.includes('force') || text.includes('energy') || text.includes('motion')) {
      themes.push('Physics');
    }
    
    // Math themes
    if (text.includes('equation') || text.includes('solve') || text.includes('calculate')) {
      themes.push('Mathematics');
    }
    if (text.includes('geometry') || text.includes('triangle') || text.includes('circle')) {
      themes.push('Geometry');
    }
    
    // History themes
    if (text.includes('war') || text.includes('battle') || text.includes('revolution')) {
      themes.push('History', 'Conflict');
    }
    if (text.includes('president') || text.includes('government') || text.includes('democracy')) {
      themes.push('Politics', 'Government');
    }
    
    // Language themes
    if (text.includes('verb') || text.includes('noun') || text.includes('grammar')) {
      themes.push('Language', 'Grammar');
    }
    
    // Literature themes
    if (text.includes('character') || text.includes('plot') || text.includes('theme')) {
      themes.push('Literature');
    }
    
    // General academic themes
    if (text.includes('definition') || text.includes('concept')) {
      themes.push('Vocabulary');
    }
    if (text.includes('fact') || text.includes('information')) {
      themes.push('Facts');
    }
    
    return [...new Set(themes)]; // Remove duplicates
  };

  const addTag = (tag: string) => {
    const updatedTags = [...currentTags, tag];
    onTagsUpdate(updatedTags);
    setSuggestedTags(prev => prev.filter(t => t !== tag));
    
    toast({
      title: "Tag added",
      description: `"${tag}" has been added to your deck.`,
    });
  };

  const removeTag = (tag: string) => {
    const updatedTags = currentTags.filter(t => t !== tag);
    onTagsUpdate(updatedTags);
    
    toast({
      title: "Tag removed",
      description: `"${tag}" has been removed from your deck.`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tags className="w-5 h-5" />
          Auto-Tagging
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={analyzeContentForTags}
            disabled={isAnalyzing}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Tags className="w-4 h-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Detect Themes'}
          </Button>
        </div>

        {currentTags.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Current Tags</label>
            <div className="flex flex-wrap gap-2">
              {currentTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {suggestedTags.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Suggested Tags</label>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => addTag(tag)}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
