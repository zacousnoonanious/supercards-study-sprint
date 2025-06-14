
import React, { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, ArrowRight, X } from 'lucide-react';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { JoinDeckDialog } from './JoinDeckDialog';

interface OptionalOrganizationSetupProps {
  onSkip?: () => void;
}

export const OptionalOrganizationSetup: React.FC<OptionalOrganizationSetupProps> = ({ onSkip }) => {
  const { userOrganizations, isLoading } = useOrganization();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center relative">
          {onSkip && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0"
              onClick={onSkip}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <CardTitle className="text-2xl">Welcome to FlashCards!</CardTitle>
          <CardDescription className="text-lg">
            What would you like to do first?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50">
              <CardHeader className="text-center">
                <Building className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Create Organization</CardTitle>
                <CardDescription>
                  Start your own team or classroom and invite members to collaborate on flashcard decks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowCreateDialog(true)} 
                  className="w-full"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Create Organization
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Join Organization</CardTitle>
                <CardDescription>
                  Join an existing team or classroom with an invite code or link.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JoinDeckDialog 
                  trigger={
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Join with Invite Code
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Start Learning Solo</h3>
                  <p className="text-muted-foreground text-sm">
                    Create personal flashcard decks and start studying. You can always join or create an organization later.
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full max-w-md"
                  onClick={onSkip}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue as Individual User
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
            <p>
              <strong>Organizations</strong> help teams manage flashcard decks, assignments, and learning progress together.
              Individual users can create personal decks and join organizations anytime.
            </p>
          </div>
        </CardContent>
      </Card>

      <CreateOrganizationDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
};
