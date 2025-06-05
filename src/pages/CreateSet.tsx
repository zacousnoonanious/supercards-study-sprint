
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
      
      navigate(`/set/${data.id}`);
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
    navigate(`/set/${deckId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="shadow-sm border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/decks')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Decks</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">Create New Deck</h1>
            </div>
            <div className="flex items-center space-x-8">
              <Navigation />
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Manual Creation */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Create Manually</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Deck Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="e.g., French Verbs, Biology Chapter 3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of this deck..."
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/decks')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Creating...' : 'Create Empty Deck'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* AI Generation */}
          <div>
            <AIFlashcardGenerator
              mode="create-new-deck"
              onGenerated={() => {}}
              onDeckCreated={handleAIDeckCreated}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground">
            Choose to create an empty deck and add cards manually, or let AI generate a complete deck for you.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CreateSet;
