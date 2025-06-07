import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { UserDropdown } from '@/components/UserDropdown';
import { Navigation } from '@/components/Navigation';
import { AIFlashcardGenerator } from '@/components/AIFlashcardGenerator';

const CreateSet = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert({
          title,
          description,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deck created successfully!",
      });
      
      navigate(`/sets/${data.id}`);
    } catch (error) {
      console.error('Error creating set:', error);
      toast({
        title: "Error",
        description: "Failed to create deck.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAIDeckCreated = (deckId: string) => {
    navigate(`/sets/${deckId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="shadow-sm border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/decks')}
                className="p-2 sm:mr-4"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Decks</span>
              </Button>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-600">Create New Deck</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-8">
              <div className="hidden sm:block">
                <Navigation />
              </div>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* AI Generation - Now first and enhanced */}
          <div className="order-1">
            <AIFlashcardGenerator
              mode="create-new-deck"
              onGenerated={() => {}}
              onDeckCreated={handleAIDeckCreated}
            />
          </div>

          {/* Manual Creation */}
          <div className="order-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Create Manually</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm sm:text-base">Deck Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="e.g., French Verbs, Biology Chapter 3"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm sm:text-base">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of this deck..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/decks')}
                      className="flex-1 w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1 w-full sm:w-auto">
                      {loading ? 'Creating...' : 'Create Empty Deck'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <Separator className="mb-4" />
          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            Use AI to generate a complete deck with quiz questions, or create an empty deck and add cards manually.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CreateSet;
