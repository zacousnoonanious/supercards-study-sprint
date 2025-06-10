
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentDecks } from '@/components/dashboard/RecentDecks';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DecksSkeleton } from '@/components/LoadingSkeletons';
import { useDataPrefetcher } from '@/hooks/useDataPrefetcher';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Enable data prefetching
  useDataPrefetcher(user?.id);

  // Concurrent data fetching with React Query
  const { data: recentSets, isLoading: setsLoading } = useQuery({
    queryKey: ['flashcard_sets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard_stats', user?.id],
    queryFn: async () => {
      // Get user's set IDs first
      const { data: userSets, error: setsError } = await supabase
        .from('flashcard_sets')
        .select('id')
        .eq('user_id', user?.id);

      if (setsError) throw setsError;

      const setIds = userSets?.map(set => set.id) || [];

      // Run all queries concurrently
      const [setsCount, cardsCount] = await Promise.all([
        supabase
          .from('flashcard_sets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id),
        setIds.length > 0 
          ? supabase
              .from('flashcards')
              .select('*', { count: 'exact', head: true })
              .in('set_id', setIds)
          : Promise.resolve({ count: 0, error: null })
      ]);

      if (setsCount.error) throw setsCount.error;
      if (cardsCount.error) throw cardsCount.error;

      return {
        totalDecks: setsCount.count || 0,
        totalCards: cardsCount.count || 0,
        studyStreak: 3, // This could be calculated from actual data
        cardsReviewed: 45 // This could be calculated from actual data
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  if (setsLoading || statsLoading) {
    return <DecksSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('welcome')} {t('back')}!</h2>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>

        <DashboardStats stats={stats} />
        <RecentDecks recentSets={recentSets || []} />
        <QuickActions />
      </main>
    </div>
  );
};

export default Dashboard;
