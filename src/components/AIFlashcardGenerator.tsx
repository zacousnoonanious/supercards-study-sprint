import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Brain, BookOpen, Image, Zap, Target, Layers, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cardTemplates } from '@/data/cardTemplates';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface AIFlashcardGeneratorProps {
  onAddElement?: (type: string) => void;
  selectedElement?: any;
  onUpdateElement?: (id: string, updates: any) => void;
  setId?: string;
  onGenerated?: () => void;
  mode?: string;
  onDeckCreated?: (deckId: string) => void;
}

export const AIFlashcardGenerator: React.FC<AIFlashcardGeneratorProps> = ({
  onAddElement,
  selectedElement,
  onUpdateElement,
  setId,
  onGenerated,
  mode = 'add-to-set',
  onDeckCreated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Basic Settings
  const [topic, setTopic] = useState('');
  const [cardCount, setCardCount] = useState([8]);
  const [style, setStyle] = useState('standard');
  const [deckTitle, setDeckTitle] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  // Template Settings
  const [templateMode, setTemplateMode] = useState<'auto' | 'fixed' | 'mixed'>('auto');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [allowedTemplates, setAllowedTemplates] = useState<string[]>([]);

  // Content Density & Structure
  const [contentDensity, setContentDensity] = useState<'key-points' | 'detailed' | 'comprehensive'>('detailed');
  const [informationDepth, setInformationDepth] = useState([70]); // Percentage
  const [includeIntroOutro, setIncludeIntroOutro] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);

  // Quiz Configuration - Updated defaults for fill-in-blank
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [quizPercentage, setQuizPercentage] = useState([25]);
  const [quizTypes, setQuizTypes] = useState({
    multipleChoice: true,
    trueFalse: true,
    fillInBlank: true, // Now enabled by default
  });
  const [mcToTfRatio, setMcToTfRatio] = useState([60]); // % MC vs TF
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');

  // Fill-in-blank specific settings
  const [fillInBlankSettings, setFillInBlankSettings] = useState({
    intelligentWordSelection: true,
    blankPercentage: 25, // Percentage of words to blank in each sentence
    avoidCommonWords: true,
  });

  // Visual & Media Integration
  const [autoIncludeImages, setAutoIncludeImages] = useState(true);
  const [imageSearchTerms, setImageSearchTerms] = useState('');
  const [imagePercentage, setImagePercentage] = useState([40]); // % of cards with images
  const [preferredImageStyle, setPreferredImageStyle] = useState<'realistic' | 'illustrations' | 'diagrams' | 'mixed'>('mixed');

  // Advanced AI Features
  const [generateRelatedTopics, setGenerateRelatedTopics] = useState(false);
  const [includeDefinitions, setIncludeDefinitions] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [adaptiveContent, setAdaptiveContent] = useState(true);
  const [targetAudience, setTargetAudience] = useState<'beginner' | 'intermediate' | 'advanced' | 'mixed'>('intermediate');

  // Real-time Generation Settings
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const generateCards = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for the flashcards.",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'create-new-deck' && !deckTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a deck title.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to generate cards.",
        variant: "destructive",
      });
      return;
    }

    // Validate quiz settings
    if (includeQuiz && !quizTypes.multipleChoice && !quizTypes.trueFalse && !quizTypes.fillInBlank) {
      toast({
        title: "Error",
        description: "Please select at least one quiz type if including quiz questions.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      let targetSetId = setId;

      // Create new deck if in create-new-deck mode
      if (mode === 'create-new-deck') {
        setGenerationProgress(20);
        const { data: newSet, error: setError } = await supabase
          .from('flashcard_sets')
          .insert({
            title: deckTitle,
            description: deckDescription || `AI-generated educational content about ${topic}`,
            user_id: user.id,
          })
          .select()
          .single();

        if (setError) throw setError;
        targetSetId = newSet.id;
      }

      if (!targetSetId) {
        throw new Error('No set ID available for card generation');
      }

      setGenerationProgress(30);

      // Enhanced generation parameters
      const generationConfig = {
        prompt: topic,
        style,
        setId: targetSetId,
        userId: user.id,
        cardCount: cardCount[0],
        
        // Template Configuration
        templateMode,
        selectedTemplate: templateMode === 'fixed' ? selectedTemplate : null,
        allowedTemplates: templateMode === 'mixed' ? allowedTemplates : [],
        
        // Content Settings
        contentDensity,
        informationDepth: informationDepth[0],
        includeIntroOutro,
        includeSummary,
        targetAudience,
        
        // Quiz Configuration
        includeQuiz,
        quizPercentage: quizPercentage[0],
        quizTypes,
        mcToTfRatio: mcToTfRatio[0],
        quizDifficulty,
        
        // Fill-in-blank Configuration
        fillInBlankSettings,
        
        // Visual & Media
        autoIncludeImages,
        imageSearchTerms: imageSearchTerms || topic,
        imagePercentage: imagePercentage[0],
        preferredImageStyle,
        
        // Advanced Features
        generateRelatedTopics,
        includeDefinitions,
        includeExamples,
        adaptiveContent,
        
        mode,
      };

      setGenerationProgress(50);

      // Call the enhanced edge function
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: generationConfig,
      });

      if (error) throw error;

      setGenerationProgress(90);

      if (data.success) {
        const totalCards = data.cardCount || cardCount[0];
        const quizCards = data.quizCards || 0;
        const informationalCards = data.informationalCards || 0;
        const imagesGenerated = data.imagesGenerated || 0;
        const fillInBlankCards = data.fillInBlankCards || 0;
        
        toast({
          title: "Success",
          description: `Generated ${totalCards} cards successfully! (${informationalCards} informational, ${quizCards} quiz, ${fillInBlankCards} fill-in-blank, ${imagesGenerated} with images)`,
        });

        if (mode === 'create-new-deck' && onDeckCreated) {
          onDeckCreated(targetSetId);
        } else if (onGenerated) {
          onGenerated();
        }

        // Reset form
        setTopic('');
        setCardCount([8]);
        setDeckTitle('');
        setDeckDescription('');
        setImageSearchTerms('');
      } else {
        throw new Error(data.error || 'Failed to generate flashcards');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const getTemplatesByType = (type: string) => {
    return cardTemplates.filter(t => t.card_type === type);
  };

  const handleTemplateToggle = (templateId: string, checked: boolean) => {
    if (checked) {
      setAllowedTemplates(prev => [...prev, templateId]);
    } else {
      setAllowedTemplates(prev => prev.filter(id => id !== templateId));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Advanced AI Educational Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Settings */}
        {mode === 'create-new-deck' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deck-title">Deck Title</Label>
              <Input
                id="deck-title"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                placeholder="e.g., Advanced Medieval Architecture, Quantum Physics Fundamentals"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deck-description">Description (Optional)</Label>
              <Input
                id="deck-description"
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                placeholder="Comprehensive educational content with interactive elements..."
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="topic">Educational Topic</Label>
          <Textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'Medieval castle architecture and defensive strategies', 'Photosynthesis process in detail', 'World War 2 timeline with key battles'"
            className="min-h-[80px]"
          />
        </div>

        {/* Template Configuration */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <Label className="text-sm font-medium">Template Strategy</Label>
          </div>
          
          <Select value={templateMode} onValueChange={(value: 'auto' | 'fixed' | 'mixed') => setTemplateMode(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Auto-Select Templates (AI chooses best layout)
                </div>
              </SelectItem>
              <SelectItem value="fixed">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Fixed Template (All cards same layout)
                </div>
              </SelectItem>
              <SelectItem value="mixed">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Mixed Templates (Select multiple)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {templateMode === 'fixed' && (
            <div className="space-y-2">
              <Label>Choose Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {cardTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.card_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {templateMode === 'mixed' && (
            <div className="space-y-2">
              <Label>Select Templates to Use</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {cardTemplates.map(template => (
                  <div key={template.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={template.id}
                      checked={allowedTemplates.includes(template.id)}
                      onCheckedChange={(checked) => handleTemplateToggle(template.id, checked as boolean)}
                    />
                    <Label htmlFor={template.id} className="text-sm">{template.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Configuration */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <Label className="text-sm font-medium">Content Strategy</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Content Density</Label>
              <Select value={contentDensity} onValueChange={(value: 'key-points' | 'detailed' | 'comprehensive') => setContentDensity(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="key-points">Key Points Only</SelectItem>
                  <SelectItem value="detailed">Detailed Explanations</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Coverage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={targetAudience} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | 'mixed') => setTargetAudience(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="mixed">Mixed Levels</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Information Depth: {informationDepth[0]}%</Label>
            <Slider
              value={informationDepth}
              onValueChange={setInformationDepth}
              max={100}
              min={30}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Surface Level</span>
              <span>Deep Dive</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="intro-outro"
                checked={includeIntroOutro}
                onCheckedChange={(checked) => setIncludeIntroOutro(checked as boolean)}
              />
              <Label htmlFor="intro-outro" className="text-sm">Include Intro/Outro Cards</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="summary"
                checked={includeSummary}
                onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
              />
              <Label htmlFor="summary" className="text-sm">Include Summary Cards</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="definitions"
                checked={includeDefinitions}
                onCheckedChange={(checked) => setIncludeDefinitions(checked as boolean)}
              />
              <Label htmlFor="definitions" className="text-sm">Auto-Generate Definitions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="examples"
                checked={includeExamples}
                onCheckedChange={(checked) => setIncludeExamples(checked as boolean)}
              />
              <Label htmlFor="examples" className="text-sm">Include Examples</Label>
            </div>
          </div>
        </div>

        {/* Visual & Media Configuration */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <Label className="text-sm font-medium">Visual & Media Integration</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-images"
              checked={autoIncludeImages}
              onCheckedChange={(checked) => setAutoIncludeImages(checked as boolean)}
            />
            <Label htmlFor="auto-images">Auto-Search & Include Relevant Images</Label>
          </div>

          {autoIncludeImages && (
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label>Custom Image Search Terms (Optional)</Label>
                <Input
                  value={imageSearchTerms}
                  onChange={(e) => setImageSearchTerms(e.target.value)}
                  placeholder="Additional search terms for images..."
                />
              </div>

              <div className="space-y-2">
                <Label>Cards with Images: {imagePercentage[0]}%</Label>
                <Slider
                  value={imagePercentage}
                  onValueChange={setImagePercentage}
                  max={80}
                  min={20}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Image Style</Label>
                <Select value={preferredImageStyle} onValueChange={(value: 'realistic' | 'illustrations' | 'diagrams' | 'mixed') => setPreferredImageStyle(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realistic Photos</SelectItem>
                    <SelectItem value="illustrations">Illustrations</SelectItem>
                    <SelectItem value="diagrams">Diagrams & Charts</SelectItem>
                    <SelectItem value="mixed">Mixed Styles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Quiz Configuration */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <Label className="text-sm font-medium">Interactive Quiz Configuration</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-quiz"
              checked={includeQuiz}
              onCheckedChange={(checked) => setIncludeQuiz(checked as boolean)}
            />
            <Label htmlFor="include-quiz">Include Interactive Quiz Questions</Label>
          </div>

          {includeQuiz && (
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label>Quiz Questions: {quizPercentage[0]}%</Label>
                <Slider
                  value={quizPercentage}
                  onValueChange={setQuizPercentage}
                  max={50}
                  min={15}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Quiz Types</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiple-choice"
                      checked={quizTypes.multipleChoice}
                      onCheckedChange={(checked) =>
                        setQuizTypes(prev => ({ ...prev, multipleChoice: checked as boolean }))
                      }
                    />
                    <Label htmlFor="multiple-choice" className="text-sm">Multiple Choice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="true-false"
                      checked={quizTypes.trueFalse}
                      onCheckedChange={(checked) =>
                        setQuizTypes(prev => ({ ...prev, trueFalse: checked as boolean }))
                      }
                    />
                    <Label htmlFor="true-false" className="text-sm">True/False</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fill-blank"
                      checked={quizTypes.fillInBlank}
                      onCheckedChange={(checked) =>
                        setQuizTypes(prev => ({ ...prev, fillInBlank: checked as boolean }))
                      }
                    />
                    <Label htmlFor="fill-blank" className="text-sm">Fill in Blank</Label>
                  </div>
                </div>
              </div>

              {/* Fill-in-blank specific settings */}
              {quizTypes.fillInBlank && (
                <div className="space-y-4 p-3 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">Fill-in-Blank Settings</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="intelligent-words"
                      checked={fillInBlankSettings.intelligentWordSelection}
                      onCheckedChange={(checked) =>
                        setFillInBlankSettings(prev => ({ ...prev, intelligentWordSelection: checked as boolean }))
                      }
                    />
                    <Label htmlFor="intelligent-words" className="text-sm">Smart Word Selection (avoids common words)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="avoid-common"
                      checked={fillInBlankSettings.avoidCommonWords}
                      onCheckedChange={(checked) =>
                        setFillInBlankSettings(prev => ({ ...prev, avoidCommonWords: checked as boolean }))
                      }
                    />
                    <Label htmlFor="avoid-common" className="text-sm">Avoid blanking articles, prepositions, etc.</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Blank Percentage: {fillInBlankSettings.blankPercentage}%</Label>
                    <Slider
                      value={[fillInBlankSettings.blankPercentage]}
                      onValueChange={(values) =>
                        setFillInBlankSettings(prev => ({ ...prev, blankPercentage: values[0] }))
                      }
                      max={50}
                      min={15}
                      step={5}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Percentage of important words to blank out in each sentence
                    </div>
                  </div>
                </div>
              )}

              {(quizTypes.multipleChoice && quizTypes.trueFalse) && (
                <div className="space-y-2">
                  <Label>Multiple Choice vs True/False Ratio: {mcToTfRatio[0]}% MC</Label>
                  <Slider
                    value={mcToTfRatio}
                    onValueChange={setMcToTfRatio}
                    max={80}
                    min={20}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Quiz Difficulty</Label>
                <Select value={quizDifficulty} onValueChange={(value: 'easy' | 'medium' | 'hard' | 'mixed') => setQuizDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="mixed">Mixed Difficulty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Advanced AI Features */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <Label className="text-sm font-medium">Advanced AI Features</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="related-topics"
                checked={generateRelatedTopics}
                onCheckedChange={(checked) => setGenerateRelatedTopics(checked as boolean)}
              />
              <Label htmlFor="related-topics" className="text-sm">Generate Related Topics</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="adaptive-content"
                checked={adaptiveContent}
                onCheckedChange={(checked) => setAdaptiveContent(checked as boolean)}
              />
              <Label htmlFor="adaptive-content" className="text-sm">Adaptive Content Flow</Label>
            </div>
          </div>
        </div>

        {/* Generation Settings */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Cards: {cardCount[0]}</Label>
              <Slider
                value={cardCount}
                onValueChange={setCardCount}
                max={25}
                min={5}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Content Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="funny">Engaging & Fun</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isGenerating && generationProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating content...</span>
              <span>{generationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={generateCards} 
          disabled={isGenerating || !topic.trim()} 
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating Advanced Educational Content...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 mr-2" />
              Generate {cardCount[0]} Advanced Educational Card{cardCount[0] !== 1 ? 's' : ''}
              {includeQuiz && ` (${Math.ceil((cardCount[0] * quizPercentage[0]) / 100)} quiz)`}
              {autoIncludeImages && ` with Images`}
            </>
          )}
        </Button>

        {/* Feature Summary */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {templateMode === 'auto' ? 'Smart Templates' : templateMode === 'fixed' ? 'Fixed Layout' : 'Mixed Layouts'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {contentDensity} Content
              </Badge>
              {autoIncludeImages && (
                <Badge variant="outline" className="text-xs">Auto Images</Badge>
              )}
              {includeQuiz && (
                <Badge variant="outline" className="text-xs">{quizPercentage[0]}% Quiz</Badge>
              )}
              {quizTypes.fillInBlank && (
                <Badge variant="outline" className="text-xs">Smart Fill-in-Blank</Badge>
              )}
              {adaptiveContent && (
                <Badge variant="outline" className="text-xs">Adaptive Flow</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
