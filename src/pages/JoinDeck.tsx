
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useInviteLinks } from '@/hooks/collaboration/useInviteLinks';

const JoinDeck = () => {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [joinStatus, setJoinStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [setId, setSetId] = useState<string | null>(null);

  const { joinDeckViaInvite } = useInviteLinks({ setId: setId || '' });

  useEffect(() => {
    if (!inviteToken) {
      setJoinStatus('error');
      setMessage('Invalid invite link.');
      return;
    }

    if (!user) {
      // Redirect to auth with return URL
      navigate(`/auth?redirect=/invite/${inviteToken}`);
      return;
    }

    handleJoinDeck();
  }, [inviteToken, user]);

  const handleJoinDeck = async () => {
    if (!inviteToken) return;

    try {
      setJoinStatus('loading');
      const result = await joinDeckViaInvite(inviteToken);
      
      if (result.success) {
        setJoinStatus('success');
        setMessage(result.message);
        
        toast({
          title: "Success!",
          description: result.message,
        });

        // Redirect to decks page after a short delay
        setTimeout(() => {
          navigate('/decks');
        }, 2000);
      } else {
        setJoinStatus('error');
        setMessage(result.message);
        
        toast({
          title: "Failed to Join",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setJoinStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
      
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    switch (joinStatus) {
      case 'loading':
        return <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-500" />;
      default:
        return <Users className="w-12 h-12 text-muted-foreground" />;
    }
  };

  const getStatusTitle = () => {
    switch (joinStatus) {
      case 'loading':
        return 'Joining Deck...';
      case 'success':
        return 'Welcome to the Team!';
      case 'error':
        return 'Unable to Join';
      default:
        return 'Join Deck';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl">
              {getStatusTitle()}
            </CardTitle>
            <CardDescription className="text-lg">
              {message || 'Processing your invitation...'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {joinStatus === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to your decks shortly...
                </p>
                <Button onClick={() => navigate('/decks')}>
                  Go to My Decks
                </Button>
              </div>
            )}
            
            {joinStatus === 'error' && (
              <div className="space-y-4">
                <Button onClick={() => navigate('/decks')} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to My Decks
                </Button>
                <p className="text-xs text-muted-foreground">
                  If you believe this is an error, please contact the person who sent you this link.
                </p>
              </div>
            )}
            
            {joinStatus === 'loading' && (
              <p className="text-sm text-muted-foreground">
                Please wait while we process your invitation...
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default JoinDeck;
