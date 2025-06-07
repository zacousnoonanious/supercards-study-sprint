
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, ArrowLeft } from 'lucide-react';

interface StudyModeCompleteProps {
  title: string;
  sessionStats: {
    correct: number;
    incorrect: number;
  };
  totalCards: number;
  onRestart: () => void;
  onBackToSet: () => void;
}

export const StudyModeComplete: React.FC<StudyModeCompleteProps> = ({
  title,
  sessionStats,
  totalCards,
  onRestart,
  onBackToSet,
}) => {
  const accuracy = totalCards > 0 ? Math.round((sessionStats.correct / totalCards) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Study Complete!</CardTitle>
          <p className="text-muted-foreground">{title}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={onRestart} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Study Again
            </Button>
            <Button onClick={onBackToSet} variant="outline" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Set
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
