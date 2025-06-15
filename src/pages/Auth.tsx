
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useOrganizationInvites } from '@/hooks/useOrganizationInvites';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { acceptInvite, getInviteDetails, isLoading } = useOrganizationInvites();
  const { toast } = useToast();
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [organizationDetails, setOrganizationDetails] = useState<any>(null);

  const inviteToken = searchParams.get('invite');

  useEffect(() => {
    if (user) {
      // If user is already logged in and has an invite token, process it
      if (inviteToken) {
        handleInviteAcceptance();
      } else {
        navigate('/dashboard');
      }
    } else if (inviteToken) {
      // User not logged in but has invite token, load invite details
      loadInviteDetails();
    }
  }, [user, inviteToken]);

  const loadInviteDetails = async () => {
    if (!inviteToken) return;

    const { invite, organization } = await getInviteDetails(inviteToken);
    if (invite && organization) {
      setInviteDetails(invite);
      setOrganizationDetails(organization);
    } else {
      toast({
        title: "Invalid Invitation",
        description: "This invitation link is invalid or has expired.",
        variant: "destructive",
      });
    }
  };

  const handleInviteAcceptance = async () => {
    if (!inviteToken) return;

    const result = await acceptInvite(inviteToken);
    
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      navigate('/dashboard');
    }
  };

  // If user is logged in and we have an invite token, show processing
  if (user && inviteToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Processing Invitation...</CardTitle>
            <CardDescription>
              Please wait while we add you to the organization.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // If we have invite details but no user, show invite preview
  if (inviteDetails && organizationDetails && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader className="text-center">
              <Mail className="w-12 h-12 mx-auto text-primary mb-2" />
              <CardTitle>You're Invited!</CardTitle>
              <CardDescription>
                Join <strong>{organizationDetails.name}</strong> on SuperCards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  You've been invited by {organizationDetails.name} to join their SuperCards organization.
                </p>
                <p className="text-sm">
                  <strong>Your role:</strong> {inviteDetails.role}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {inviteDetails.email}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-4">
                  Please sign up or log in to accept this invitation
                </p>
              </div>
            </CardContent>
          </Card>
          <AuthLayout />
        </div>
      </div>
    );
  }

  // Default auth layout
  return <AuthLayout />;
};

export default Auth;
