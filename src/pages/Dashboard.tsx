import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Clock, TrendingUp, Play, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { UserDropdown } from '@/components/UserDropdown';
import { Navigation } from '@/components/Navigation';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalDecks: number;
  totalCards: number;
  studyStreak: number;
  cardsReviewed: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [recentSets, setRecentSets] = useState<FlashcardSet[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDecks: 0,
    totalCards: 0,
    studyStreak: 3,
    cardsReviewed: 45
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent sets (limit to 3)
      const { data: setsData, error: setsError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(3);

      if (setsError) throw setsError;
      setRecentSets(setsData || []);

      // Fetch total decks count
      const { count: decksCount, error: decksCountError } = await supabase
        .from('flashcard_sets')
        .select('*', { count: 'exact', head: true });

      if (decksCountError) throw decksCountError;

      // Fetch total cards count
      const { count: cardsCount, error: cardsCountError } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true });

      if (cardsCountError) throw cardsCountError;

      setStats(prev => ({
        ...prev,
        totalDecks: decksCount || 0,
        totalCards: cardsCount || 0
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="shadow-sm border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-indigo-600">{t('header.brand')}</h1>
              <Navigation />
            </div>
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('dashboard.welcome')}</h2>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.stats.totalDecks')}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDecks}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.stats.totalCards')}</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCards}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.stats.studyStreak')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.studyStreak} {t('dashboard.stats.days')}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.stats.cardsReviewed')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cardsReviewed}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.stats.thisWeek')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Decks Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">{t('dashboard.recentDecks')}</h3>
            <Button variant="outline" onClick={() => navigate('/decks')}>
              {t('dashboard.viewAllDecks')}
            </Button>
          </div>
          
          {recentSets.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h4 className="text-md font-medium text-foreground mb-2">{t('dashboard.noDecks')}</h4>
                <p className="text-muted-foreground mb-4">{t('dashboard.noDecksDesc')}</p>
                <Button onClick={() => navigate('/create-set')}>
                  {t('dashboard.createFirstDeck')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentSets.map(set => (
                <Card key={set.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-sm truncate">{set.title}</CardTitle>
                    <CardDescription className="text-xs">{set.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/sets/${set.id}`)} className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        {t('view')}
                      </Button>
                      <Button size="sm" onClick={() => navigate(`/sets/${set.id}/study`)} className="flex-1">
                        <Play className="w-3 h-3 mr-1" />
                        {t('decks.study')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            <CardDescription>{t('dashboard.quickActions.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/create-set')} className="flex-1">
                {t('dashboard.actions.createDeck')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/decks')} className="flex-1">
                {t('dashboard.actions.browseDeck')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/marketplace')} className="flex-1">
                {t('dashboard.actions.marketplace')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
