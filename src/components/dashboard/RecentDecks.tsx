
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface RecentDecksProps {
  recentSets: FlashcardSet[];
}

export const RecentDecks: React.FC<RecentDecksProps> = ({ recentSets }) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  console.log('RecentDecks component received sets:', recentSets);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Decks</h3>
        <Button variant="outline" onClick={() => navigate('/decks')}>
          View All Decks
        </Button>
      </div>
      
      {recentSets.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-md font-medium text-foreground mb-2">No decks yet</h4>
            <p className="text-muted-foreground mb-4">Create your first deck to get started!</p>
            <Button onClick={() => navigate('/create-set')}>
              Create First Deck
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentSets.map((set) => {
            console.log('Rendering deck:', set);
            return (
              <Card key={set.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-sm truncate">{set.title}</CardTitle>
                  <CardDescription className="text-xs">{set.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/set/${set.id}`)} className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" onClick={() => navigate(`/set/${set.id}/study`)} className="flex-1">
                      <Play className="w-3 h-3 mr-1" />
                      Study
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
