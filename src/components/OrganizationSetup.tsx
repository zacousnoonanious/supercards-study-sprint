
import React, { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, Plus } from 'lucide-react';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';

export const OrganizationSetup: React.FC = () => {
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
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to FlashCards!</CardTitle>
          <CardDescription className="text-lg">
            Get started by joining an organization or creating your own.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <Building className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Create Organization</CardTitle>
                <CardDescription>
                  Start your own organization and invite team members.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowCreateDialog(true)} 
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Organization
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Join Organization</CardTitle>
                <CardDescription>
                  Join an existing organization with an invite code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Join with Invite Code
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg">
            <p>
              <strong>Organizations</strong> help you manage flashcard decks, assignments, and team progress.
              You can always create personal decks outside of any organization.
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
