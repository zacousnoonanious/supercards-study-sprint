
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useSRS } from '@/hooks/useSRS';
import { useNavigate } from 'react-router-dom';

interface SRSProgressProps {
  className?: string;
}

export const SRSProgress: React.FC<SRSProgressProps> = ({ className }) => {
  const { cardsdue, loading, fetchCardsdue } = useSRS();
  const navigate = useNavigate();

  const handleStudyDueCards = () => {
    if (cardsdue.length > 0) {
      // Navigate to study mode with SRS filter
      const firstDeckId = cardsdue[0].set_id;
      navigate(`/study/${firstDeckId}?srs=true`);
    }
  };

  const dueTodayCount = cardsdue.filter(card => 
    new Date(card.next_review_date) <= new Date()
  ).length;

  const overDueCount = cardsdue.filter(card => 
    new Date(card.next_review_date) < new Date()
  ).length;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            SRS Review Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          SRS Review Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{dueTodayCount}</div>
            <div className="text-sm text-muted-foreground">Due Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{overDueCount}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{cardsdue.length}</div>
            <div className="text-sm text-muted-foreground">Total Queue</div>
          </div>
        </div>

        {cardsdue.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent Due Cards:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {cardsdue.slice(0, 5).map((card) => (
                <div key={card.card_id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Reviews: {card.total_reviews}</span>
                  </div>
                  <Badge variant={new Date(card.next_review_date) < new Date() ? "destructive" : "secondary"}>
                    {new Date(card.next_review_date) < new Date() ? "Overdue" : "Due"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleStudyDueCards} 
            disabled={cardsdue.length === 0}
            className="flex-1"
          >
            <Clock className="w-4 h-4 mr-2" />
            Study Due Cards
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchCardsdue}
            disabled={loading}
          >
            <TrendingUp className="w-4 h-4" />
          </Button>
        </div>

        {cardsdue.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No cards due for review today!</p>
            <p className="text-xs">Great job staying on top of your studies.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
