import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Target, Clock, Brain, AlertTriangle, Trophy, BookOpen, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StudyActivityHeatmap } from './StudyActivityHeatmap';
import { DeckPerformanceBreakdown } from './DeckPerformanceBreakdown';

interface StudyMetrics {
  totalStudyTime: number;
  totalCardsReviewed: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  studySessionsCount: number;
}

interface LearningPattern {
  date: string;
  studyTime: number;
  cardsReviewed: number;
  accuracy: number;
  sessionsCount: number;
}

interface WeakArea {
  setId: string;
  setTitle: string;
  accuracy: number;
  reviewCount: number;
  avgTimePerCard: number;
  lastReviewed: string;
}

interface CategoryPerformance {
  category: string;
  accuracy: number;
  totalCards: number;
  reviewTime: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export const PerformanceAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [timeRange, setTimeRange] = useState('30');
  const [metrics, setMetrics] = useState<StudyMetrics | null>(null);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      await Promise.all([
        fetchStudyMetrics(),
        fetchLearningPatterns(),
        fetchWeakAreas(),
        fetchCategoryPerformance()
      ]);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyMetrics = async () => {
    try {
      // Get user stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      // Get study sessions count
      const { data: sessions, count } = await supabase
        .from('study_sessions')
        .select('id', { count: 'exact' })
        .eq('user_id', user!.id)
        .gte('started_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString());

      // Calculate average accuracy from recent reviews
      const { data: reviews } = await supabase
        .from('card_reviews')
        .select('score')
        .eq('user_id', user!.id)
        .gte('reviewed_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString());

      const averageAccuracy = reviews && reviews.length > 0 
        ? (reviews.reduce((sum, review) => sum + (review.score >= 3 ? 1 : 0), 0) / reviews.length) * 100
        : 0;

      setMetrics({
        totalStudyTime: userStats?.total_study_time_seconds || 0,
        totalCardsReviewed: userStats?.total_cards_reviewed || 0,
        averageAccuracy,
        currentStreak: userStats?.current_streak || 0,
        longestStreak: userStats?.longest_streak || 0,
        studySessionsCount: count || 0
      });
    } catch (error) {
      console.error('Error fetching study metrics:', error);
    }
  };

  const fetchLearningPatterns = async () => {
    try {
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('started_at, total_time_seconds, cards_reviewed, correct_answers, incorrect_answers')
        .eq('user_id', user!.id)
        .gte('started_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString())
        .order('started_at', { ascending: true });

      if (!sessions) return;

      // Group by date
      const grouped = sessions.reduce((acc, session) => {
        const date = new Date(session.started_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            studyTime: 0,
            cardsReviewed: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            sessionsCount: 0
          };
        }
        acc[date].studyTime += session.total_time_seconds || 0;
        acc[date].cardsReviewed += session.cards_reviewed || 0;
        acc[date].correctAnswers += session.correct_answers || 0;
        acc[date].totalAnswers += (session.correct_answers || 0) + (session.incorrect_answers || 0);
        acc[date].sessionsCount += 1;
        return acc;
      }, {} as any);

      const patterns = Object.values(grouped).map((day: any) => ({
        date: new Date(day.date).toLocaleDateString(),
        studyTime: Math.round(day.studyTime / 60), // Convert to minutes
        cardsReviewed: day.cardsReviewed,
        accuracy: day.totalAnswers > 0 ? Math.round((day.correctAnswers / day.totalAnswers) * 100) : 0,
        sessionsCount: day.sessionsCount
      }));

      setLearningPatterns(patterns);
    } catch (error) {
      console.error('Error fetching learning patterns:', error);
    }
  };

  const fetchWeakAreas = async () => {
    try {
      const { data: cardStats } = await supabase
        .from('user_card_stats')
        .select(`
          card_id,
          total_reviews,
          correct_reviews,
          last_reviewed_at,
          flashcards!inner(
            set_id,
            flashcard_sets!inner(
              title
            )
          )
        `)
        .eq('user_id', user!.id)
        .gt('total_reviews', 2); // Only include cards with sufficient data

      if (!cardStats) return;

      // Group by set and calculate accuracy
      const setPerformance = cardStats.reduce((acc, stat) => {
        const setId = stat.flashcards.set_id;
        const setTitle = stat.flashcards.flashcard_sets.title;
        const accuracy = stat.total_reviews > 0 ? (stat.correct_reviews / stat.total_reviews) * 100 : 0;

        if (!acc[setId]) {
          acc[setId] = {
            setId,
            setTitle,
            totalAccuracy: 0,
            totalReviews: 0,
            cardCount: 0,
            lastReviewed: stat.last_reviewed_at
          };
        }

        acc[setId].totalAccuracy += accuracy;
        acc[setId].totalReviews += stat.total_reviews;
        acc[setId].cardCount += 1;
        
        if (new Date(stat.last_reviewed_at) > new Date(acc[setId].lastReviewed)) {
          acc[setId].lastReviewed = stat.last_reviewed_at;
        }

        return acc;
      }, {} as any);

      // Calculate weak areas (sets with low accuracy)
      const weakAreas = Object.values(setPerformance)
        .map((set: any) => ({
          setId: set.setId,
          setTitle: set.setTitle,
          accuracy: Math.round(set.totalAccuracy / set.cardCount),
          reviewCount: set.totalReviews,
          avgTimePerCard: 45, // Placeholder - would need actual timing data
          lastReviewed: new Date(set.lastReviewed).toLocaleDateString()
        }))
        .filter(area => area.accuracy < 70) // Only include sets with < 70% accuracy
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5);

      setWeakAreas(weakAreas);
    } catch (error) {
      console.error('Error fetching weak areas:', error);
    }
  };

  const fetchCategoryPerformance = async () => {
    try {
      // This would be enhanced with actual category data
      // For now, we'll create mock data based on set performance
      const mockCategories = [
        { category: 'Mathematics', accuracy: 85, totalCards: 120, reviewTime: 8.5 },
        { category: 'Science', accuracy: 72, totalCards: 95, reviewTime: 12.3 },
        { category: 'History', accuracy: 91, totalCards: 78, reviewTime: 6.8 },
        { category: 'Languages', accuracy: 68, totalCards: 156, reviewTime: 15.2 },
        { category: 'Literature', accuracy: 83, totalCards: 89, reviewTime: 9.7 }
      ];
      setCategoryPerformance(mockCategories);
    } catch (error) {
      console.error('Error fetching category performance:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' };
    if (accuracy >= 80) return { level: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (accuracy >= 70) return { level: 'Average', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (accuracy >= 60) return { level: 'Below Average', color: 'bg-orange-500', textColor: 'text-orange-700' };
    return { level: 'Needs Improvement', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your learning patterns and progress</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics ? formatTime(metrics.totalStudyTime) : '0m'}</div>
            <p className="text-xs text-muted-foreground">
              {metrics && metrics.studySessionsCount > 0 
                ? `Avg ${formatTime(Math.round(metrics.totalStudyTime / metrics.studySessionsCount))} per session`
                : 'No sessions yet'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Reviewed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalCardsReviewed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across {metrics?.studySessionsCount || 0} study sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics?.averageAccuracy || 0)}%</div>
            <div className="flex items-center mt-1">
              <Badge 
                variant="secondary" 
                className={getPerformanceLevel(metrics?.averageAccuracy || 0).textColor}
              >
                {getPerformanceLevel(metrics?.averageAccuracy || 0).level}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.currentStreak || 0} days</div>
            <p className="text-xs text-muted-foreground">
              Best: {metrics?.longestStreak || 0} days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Study Activity</TabsTrigger>
          <TabsTrigger value="patterns">Learning Patterns</TabsTrigger>
          <TabsTrigger value="performance">Deck & Tag Performance</TabsTrigger>
          <TabsTrigger value="weak-areas">Weak Areas</TabsTrigger>
          <TabsTrigger value="categories">Category Performance</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <StudyActivityHeatmap />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Study Time Trends</CardTitle>
                <CardDescription>Daily study time over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={learningPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="studyTime" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accuracy Trends</CardTitle>
                <CardDescription>Daily accuracy percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={learningPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cards Reviewed Daily</CardTitle>
              <CardDescription>Number of cards reviewed each day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={learningPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="cardsReviewed" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <DeckPerformanceBreakdown />
        </TabsContent>

        <TabsContent value="weak-areas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Areas Needing Attention
              </CardTitle>
              <CardDescription>
                Decks with accuracy below 70% that may need additional practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weakAreas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Great job! No weak areas detected.</p>
                  <p className="text-sm">All your decks are performing well.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {weakAreas.map((area) => (
                    <div key={area.setId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{area.setTitle}</h3>
                        <Badge variant="destructive">{area.accuracy}% accuracy</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p className="font-medium">Reviews</p>
                          <p>{area.reviewCount} total</p>
                        </div>
                        <div>
                          <p className="font-medium">Avg Time</p>
                          <p>{area.avgTimePerCard}s per card</p>
                        </div>
                        <div>
                          <p className="font-medium">Last Reviewed</p>
                          <p>{area.lastReviewed}</p>
                        </div>
                      </div>
                      <Progress value={area.accuracy} className="mt-3" />
                      <div className="mt-3">
                        <Button size="sm" variant="outline">
                          Review This Deck
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Accuracy</CardTitle>
                <CardDescription>Performance comparison across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="accuracy" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study Time Distribution</CardTitle>
                <CardDescription>Time spent on each category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPerformance}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="reviewTime"
                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Learning Efficiency</CardTitle>
                <CardDescription>Cards reviewed per minute of study time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {metrics && metrics.totalStudyTime > 0 
                    ? ((metrics.totalCardsReviewed / (metrics.totalStudyTime / 60))).toFixed(1)
                    : '0'
                  } cards/min
                </div>
                <p className="text-sm text-muted-foreground">
                  Efficiency is {metrics && metrics.totalStudyTime > 0 && (metrics.totalCardsReviewed / (metrics.totalStudyTime / 60)) > 2 ? 'above' : 'below'} average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study Consistency</CardTitle>
                <CardDescription>Based on your study streak and session frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Streak</span>
                    <span className="font-medium">{metrics?.currentStreak || 0} days</span>
                  </div>
                  <Progress value={Math.min((metrics?.currentStreak || 0) / 30 * 100, 100)} />
                  <p className="text-xs text-muted-foreground">
                    {metrics?.currentStreak === 0 
                      ? 'Start a streak by studying today!'
                      : metrics?.currentStreak < 7
                      ? 'Building consistency...'
                      : metrics?.currentStreak < 30
                      ? 'Great consistency!'
                      : 'Excellent dedication!'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Radar</CardTitle>
              <CardDescription>Overall performance across different metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { subject: 'Accuracy', A: metrics?.averageAccuracy || 0, fullMark: 100 },
                    { subject: 'Consistency', A: Math.min((metrics?.currentStreak || 0) / 30 * 100, 100), fullMark: 100 },
                    { subject: 'Volume', A: Math.min((metrics?.totalCardsReviewed || 0) / 1000 * 100, 100), fullMark: 100 },
                    { subject: 'Efficiency', A: Math.min(((metrics?.totalCardsReviewed || 0) / ((metrics?.totalStudyTime || 1) / 60)) / 5 * 100, 100), fullMark: 100 },
                    { subject: 'Retention', A: Math.min((metrics?.currentStreak || 0) / 14 * 100, 100), fullMark: 100 }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
