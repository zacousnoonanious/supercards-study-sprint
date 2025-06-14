
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import { AIFlashcardGenerator } from '@/components/AIFlashcardGenerator';

const CreateSet = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: t('messages.error.validation'),
        description: t('messages.error.required'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating flashcard set with:', { title: title.trim(), description: description.trim(), user_id: user?.id });
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            user_id: user?.id
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating set:', error);
        throw error;
      }

      console.log('Set created successfully:', data);

      toast({
        title: t('messages.success.created'),
        description: 'Flashcard set created successfully!'
      });

      // Navigate to the set view page instead of edit-cards (which doesn't exist)
      navigate(`/set/${data.id}`);
    } catch (error) {
      console.error('Error creating set:', error);
      toast({
        title: t('messages.error.general'),
        description: 'Failed to create flashcard set. Please try again.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAIDeckCreated = (deckId: string) => {
    navigate(`/set/${deckId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/decks')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
          <h2 className="text-2xl font-bold text-foreground">{t('sets.create')}</h2>
        </div>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t('ai.generateDeck')}
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Manually
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  {t('ai.generateDeck')}
                </CardTitle>
                <CardDescription>
                  Let AI create a complete flashcard deck with advanced educational content, interactive quizzes, and visual elements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIFlashcardGenerator
                  mode="create-new-deck"
                  onDeckCreated={handleAIDeckCreated}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Set</CardTitle>
                <CardDescription>
                  Create a new flashcard set manually and add cards one by one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a title for your flashcard set"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this flashcard set is about"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/decks')}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Creating...' : 'Create Set'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CreateSet;
