
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

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { currentOrganization, userOrganizations, isLoading } = useOrganization();
  const { t } = useI18n();
  const [showOrgSetup, setShowOrgSetup] = useState(false);
  const [recentSets, setRecentSets] = useState<FlashcardSet[]>([]);
  const [totalDecks, setTotalDecks] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data for user:', user?.id);
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching dashboard data:', error);
        return;
      }
      
      console.log('Dashboard data fetched:', data);
      const sets = data || [];
      setRecentSets(sets.slice(0, 3)); // Show only 3 most recent
      setTotalDecks(sets.length); // Set total count
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Welcome to FlashCards</CardTitle>
              <CardDescription>Please sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/auth">
                <Button className="w-full">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show organization setup if user wants to see it
  if (showOrgSetup) {
    return (
      <>
        <Navigation />
        <OptionalOrganizationSetup onSkip={() => setShowOrgSetup(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t('nav.dashboard')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {currentOrganization 
              ? `Welcome to ${currentOrganization.name}` 
              : 'Manage your flashcards and study progress'
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
                    <h3 className="font-semibold">Ready to collaborate?</h3>
                    <p className="text-sm text-muted-foreground">
                      Join or create an organization to work with your team on flashcard decks.
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowOrgSetup(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDecks}</div>
              <p className="text-xs text-muted-foreground">
                Your flashcard decks
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                +0 from last week
              </p>
            </CardContent>
          </Card>

          {currentOrganization && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">
                    Active members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Active assignments
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Add recent decks section */}
        <RecentDecks recentSets={recentSets} />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your flashcards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/create-set">
                <Button className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Deck
                </Button>
              </Link>
              <Link to="/decks">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View All Decks
                </Button>
              </Link>
              {userOrganizations.length === 0 && (
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => setShowOrgSetup(true)}
                >
                  <Building className="mr-2 h-4 w-4" />
                  Join or Create Organization
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest study sessions and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No recent activity yet. Start studying to see your progress here!
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
