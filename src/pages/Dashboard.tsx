import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { OptionalOrganizationSetup } from '@/components/OptionalOrganizationSetup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Users, BarChart3, Building, UserPlus } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { RecentDecks } from '@/components/dashboard/RecentDecks';
import { Onboarding } from '@/components/Onboarding';
import { useToast } from '@/hooks/use-toast';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, loading, updateUserMetadata } = useAuth();
  const { currentOrganization, userOrganizations, isLoading } = useOrganization();
  const { t } = useI18n();
  const [recentSets, setRecentSets] = useState<FlashcardSet[]>([]);
  const [totalDecks, setTotalDecks] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user && !loading) {
      if (!user.user_metadata?.onboarding_complete) {
        setShowOnboarding(true);
      }
      setCheckingStatus(false);
      fetchDashboardData();
    } else if (!loading) {
      setCheckingStatus(false);
    }
  }, [user, loading]);

  const handleOnboardingComplete = async () => {
    if (!user) return;
    try {
      const { error } = await updateUserMetadata({ onboarding_complete: true });
      if (error) {
        toast({ title: "Error", description: "Failed to save onboarding status.", variant: "destructive" });
      } else {
        setShowOnboarding(false);
        toast({ title: "Setup Complete!", description: "Welcome aboard! Let's get started." });
      }
    } catch (e) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching flashcard sets for user:', user?.id);
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('id, title, description, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching flashcard sets:', error);
        return;
      }
      
      console.log('Successfully fetched flashcard sets:', data);
      const sets = data || [];
      setRecentSets(sets.slice(0, 3));
      setTotalDecks(sets.length);
      
    } catch (error) {
      console.error('Unexpected error in fetchDashboardData:', error);
    }
  };

  if (loading || isLoading || checkingStatus) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t('nav.dashboard')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {currentOrganization 
              ? t('dashboard.welcome', { name: currentOrganization.name }) 
              : t('dashboard.welcomePersonal')
            }
          </p>
        </div>

        {/* Show organization invitation banner for individual users */}
        {userOrganizations.length === 0 && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Building className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">{t('dashboard.collaborateTitle')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.collaborateDescription')}
                    </p>
                  </div>
                </div>
                <Button onClick={() => {
                  // This could be changed to open a dialog to create/join an org
                  alert("You can create or join an organization from your profile settings.");
                }}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('dashboard.getStarted')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalDecks')}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDecks}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.totalDecksDescription')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.studySessions')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.studySessionsDescription')}
              </p>
            </CardContent>
          </Card>

          {currentOrganization && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.teamMembers')}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.teamMembersDescription')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.assignments')}</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.assignmentsDescription')}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Recent decks section */}
        <RecentDecks recentSets={recentSets} />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
              <CardDescription>{t('dashboard.quickActionsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/create-set">
                <Button className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('dashboard.createNewDeck')}
                </Button>
              </Link>
              <Link to="/decks">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t('dashboard.viewAllDecks')}
                </Button>
              </Link>
              {userOrganizations.length === 0 && (
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => {
                    alert("You can create or join an organization from your profile settings.");
                  }}
                >
                  <Building className="mr-2 h-4 w-4" />
                  {t('dashboard.joinOrCreateOrg')}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
              <CardDescription>{t('dashboard.recentActivityDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {t('dashboard.noRecentActivity')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
