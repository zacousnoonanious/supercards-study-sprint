
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, TrendingDown, Target, Trophy, AlertTriangle, Calendar, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserInsights {
  strongestDeck: { name: string; accuracy: number } | null;
  weakestDeck: { name: string; accuracy: number } | null;
  overallTrend: 'improving' | 'declining' | 'stable';
  currentStreak: number;
  longestStreak: number;
  streakTrend: 'improving' | 'declining' | 'stable';
  studyConsistency: number; // percentage
  totalStudyTime: number;
  averageAccuracy: number;
  cardsReviewed: number;
  recentPerformance: {
    lastWeekAccuracy: number;
    previousWeekAccuracy: number;
  };
  studyGaps: {
    longestGap: number; // days
    lastGap: number; // days
  };
}

export const PersonalizedInsights: React.FC = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserInsights();
    }
  }, [user]);

  const fetchUserInsights = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch basic user stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch deck performance
      const { data: deckPerformance } = await supabase
        .from('user_card_stats')
        .select(`
          current_ease_factor,
          total_reviews,
          correct_reviews,
          flashcards!inner(
            set_id,
            flashcard_sets!inner(
              title
            )
          )
        `)
        .eq('user_id', user.id)
        .gt('total_reviews', 2);

      // Fetch recent reviews for trend analysis
      const { data: recentReviews } = await supabase
        .from('card_reviews')
        .select('score, reviewed_at')
        .eq('user_id', user.id)
        .gte('reviewed_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('reviewed_at', { ascending: false });

      // Fetch study sessions for consistency analysis
      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('started_at, ended_at')
        .eq('user_id', user.id)
        .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('started_at', { ascending: false });

      const processedInsights = processInsights(userStats, deckPerformance, recentReviews, studySessions);
      setInsights(processedInsights);
    } catch (error) {
      console.error('Error fetching user insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const processInsights = (
    userStats: any,
    deckPerformance: any[],
    recentReviews: any[],
    studySessions: any[]
  ): UserInsights => {
    // Process deck performance
    const deckAccuracy: { [key: string]: { name: string; accuracy: number; totalReviews: number } } = {};
    
    if (deckPerformance) {
      deckPerformance.forEach(stat => {
        const deckName = stat.flashcards.flashcard_sets.title;
        const accuracy = stat.total_reviews > 0 ? (stat.correct_reviews / stat.total_reviews) * 100 : 0;
        
        if (!deckAccuracy[deckName]) {
          deckAccuracy[deckName] = { name: deckName, accuracy: 0, totalReviews: 0 };
        }
        
        deckAccuracy[deckName].accuracy += accuracy;
        deckAccuracy[deckName].totalReviews += stat.total_reviews;
      });

      // Average accuracy per deck
      Object.keys(deckAccuracy).forEach(deckName => {
        const deck = deckAccuracy[deckName];
        deck.accuracy = deck.accuracy / deckPerformance.filter(d => d.flashcards.flashcard_sets.title === deckName).length;
      });
    }

    const decks = Object.values(deckAccuracy).filter(d => d.totalReviews > 5);
    const strongestDeck = decks.length > 0 ? decks.reduce((max, deck) => deck.accuracy > max.accuracy ? deck : max) : null;
    const weakestDeck = decks.length > 0 ? decks.reduce((min, deck) => deck.accuracy < min.accuracy ? deck : min) : null;

    // Process recent performance trends
    const lastWeekReviews = recentReviews?.filter(r => 
      new Date(r.reviewed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) || [];
    
    const previousWeekReviews = recentReviews?.filter(r => {
      const reviewDate = new Date(r.reviewed_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return reviewDate <= weekAgo && reviewDate > twoWeeksAgo;
    }) || [];

    const lastWeekAccuracy = lastWeekReviews.length > 0 
      ? (lastWeekReviews.filter(r => r.score >= 3).length / lastWeekReviews.length) * 100
      : 0;
    
    const previousWeekAccuracy = previousWeekReviews.length > 0 
      ? (previousWeekReviews.filter(r => r.score >= 3).length / previousWeekReviews.length) * 100
      : 0;

    const overallTrend = lastWeekAccuracy > previousWeekAccuracy + 5 ? 'improving' : 
                        lastWeekAccuracy < previousWeekAccuracy - 5 ? 'declining' : 'stable';

    // Study consistency (days studied in last 30 days)
    const studyDays = new Set(
      studySessions?.map(s => new Date(s.started_at).toDateString()) || []
    );
    const studyConsistency = (studyDays.size / 30) * 100;

    // Streak analysis
    const currentStreak = userStats?.current_streak || 0;
    const longestStreak = userStats?.longest_streak || 0;
    const streakTrend = currentStreak >= longestStreak * 0.8 ? 'improving' : 
                       currentStreak < longestStreak * 0.5 ? 'declining' : 'stable';

    // Study gaps (mock data - would need more complex analysis)
    const studyGaps = {
      longestGap: 5, // placeholder
      lastGap: 2     // placeholder
    };

    return {
      strongestDeck,
      weakestDeck,
      overallTrend,
      currentStreak,
      longestStreak,
      streakTrend,
      studyConsistency: Math.round(studyConsistency),
      totalStudyTime: userStats?.total_study_time_seconds || 0,
      averageAccuracy: Math.round(lastWeekAccuracy),
      cardsReviewed: userStats?.total_cards_reviewed || 0,
      recentPerformance: {
        lastWeekAccuracy: Math.round(lastWeekAccuracy),
        previousWeekAccuracy: Math.round(previousWeekAccuracy)
      },
      studyGaps
    };
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendBadge = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving': return <Badge variant="default" className="bg-green-100 text-green-800">Improving</Badge>;
      case 'declining': return <Badge variant="destructive">Declining</Badge>;
      case 'stable': return <Badge variant="secondary">Stable</Badge>;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">Loading personalized insights...</div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Not enough data to generate insights.</p>
        <p className="text-sm">Keep studying to unlock personalized recommendations!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Insights Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Strongest Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Your Strength
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.strongestDeck ? (
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(insights.strongestDeck.accuracy)}%
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  accuracy in <span className="font-medium">{insights.strongestDeck.name}</span>
                </p>
                <Progress value={insights.strongestDeck.accuracy} className="h-2" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Study more decks to identify strengths</p>
            )}
          </CardContent>
        </Card>

        {/* Area for Improvement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Focus Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.weakestDeck ? (
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(insights.weakestDeck.accuracy)}%
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  accuracy in <span className="font-medium">{insights.weakestDeck.name}</span>
                </p>
                <Progress value={insights.weakestDeck.accuracy} className="h-2" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">More data needed for recommendations</p>
            )}
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-blue-500" />
              Study Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{insights.currentStreak} days</div>
              {getTrendIcon(insights.streakTrend)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Best: {insights.longestStreak} days
            </p>
            {getTrendBadge(insights.streakTrend)}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends
            </CardTitle>
            <CardDescription>Your learning progress over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Trend</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(insights.overallTrend)}
                {getTrendBadge(insights.overallTrend)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Last Week</span>
                <span className="font-medium">{insights.recentPerformance.lastWeekAccuracy}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Previous Week</span>
                <span className="font-medium">{insights.recentPerformance.previousWeekAccuracy}%</span>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Study Consistency</span>
                <span className="text-sm">{insights.studyConsistency}%</span>
              </div>
              <Progress value={insights.studyConsistency} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Studied {Math.round(insights.studyConsistency * 0.3)} days in the last month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Study Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Study Summary
            </CardTitle>
            <CardDescription>Your overall learning statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{formatTime(insights.totalStudyTime)}</div>
                <p className="text-xs text-muted-foreground">Total Study Time</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{insights.cardsReviewed}</div>
                <p className="text-xs text-muted-foreground">Cards Reviewed</p>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Average Accuracy</span>
                <span className="text-sm font-bold">{insights.averageAccuracy}%</span>
              </div>
              <Progress value={insights.averageAccuracy} className="h-2" />
            </div>
            
            <div className="pt-2 border-t text-sm">
              <div className="flex justify-between">
                <span>Study Efficiency</span>
                <span>{insights.totalStudyTime > 0 ? (insights.cardsReviewed / (insights.totalStudyTime / 60)).toFixed(1) : '0'} cards/min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>Based on your study patterns and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.overallTrend === 'improving' && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Great progress!</p>
                  <p className="text-sm text-green-700">
                    Your accuracy has improved this week. Keep up the consistent study schedule to maintain this momentum.
                  </p>
                </div>
              </div>
            )}
            
            {insights.weakestDeck && insights.weakestDeck.accuracy < 70 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">Focus on {insights.weakestDeck.name}</p>
                  <p className="text-sm text-orange-700">
                    This deck needs attention. Consider reviewing it more frequently or breaking it into smaller chunks.
                  </p>
                </div>
              </div>
            )}
            
            {insights.studyConsistency < 50 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Build consistency</p>
                  <p className="text-sm text-blue-700">
                    Try studying for shorter periods more frequently. Even 10-15 minutes daily can improve retention.
                  </p>
                </div>
              </div>
            )}
            
            {insights.currentStreak < 3 && insights.longestStreak > 5 && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-800">Rebuild your streak</p>
                  <p className="text-sm text-purple-700">
                    You've had a {insights.longestStreak}-day streak before. Start small and build back up to that level!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
