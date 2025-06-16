
import React from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface OptionalOrganizationSetupProps {
  onSkip?: () => void;
}

export const OptionalOrganizationSetup: React.FC<OptionalOrganizationSetupProps> = ({ onSkip }) => {
  const { userOrganizations, isLoading } = useOrganization();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (userOrganizations.length > 0) {
    return null; // User already has organizations
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to FlashCards!</CardTitle>
          <CardDescription className="text-lg">
            Let's get you started with your personal learning journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Start Learning</h3>
                  <p className="text-muted-foreground text-sm">
                    Create personal flashcard decks and start studying right away. 
                    Track your progress and improve your knowledge retention.
                  </p>
                </div>
                <Button 
                  className="w-full max-w-md"
                  onClick={onSkip}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
            <p>
              <strong>Personal Learning:</strong> Create your own flashcard decks, 
              study at your own pace, and track your learning progress.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
