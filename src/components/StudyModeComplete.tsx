
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface StudyModeCompleteProps {
  setId: string;
  sessionStats: { correct: number; incorrect: number };
  onResetStudy: () => void;
}

export const StudyModeComplete: React.FC<StudyModeCompleteProps> = ({
  setId,
  sessionStats,
  onResetStudy,
}) => {
  const navigate = useNavigate();
  const totalCards = sessionStats.correct + sessionStats.incorrect;
  const accuracy = totalCards > 0 ? Math.round((sessionStats.correct / totalCards) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate(`/set/${setId}`)}
              className="mr-2 sm:mr-4 p-2"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Set</span>
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-green-600">Study Complete!</h1>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-green-600">Great job!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="text-3xl sm:text-4xl font-bold text-primary">{accuracy}%</div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Incorrect</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button onClick={onResetStudy} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Study Again
              </Button>
              <Button variant="outline" onClick={() => navigate(`/set/${setId}`)} className="flex-1">
                Back to Set
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
