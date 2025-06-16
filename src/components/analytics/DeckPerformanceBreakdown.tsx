
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, TrendingUp, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DeckPerformance {
  setId: string;
  setTitle: string;
  avgAccuracy: number;
  totalStudyTime: number;
  avgEaseFactor: number;
  totalReviews: number;
  cardCount: number;
  lastStudied: string;
}

interface TagPerformance {
  tag: string;
  avgAccuracy: number;
  totalStudyTime: number;
  avgEaseFactor: number;
  reviewCount: number;
  cardCount: number;
}

export const DeckPerformanceBreakdown: React.FC = () => {
  const { user } = useAuth();
  const [deckPerformance, setDeckPerformance] = useState<DeckPerformance[]>([]);
  const [tagPerformance, setTagPerformance] = useState<TagPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPerformanceData();
    }
  }, [user]);

  const fetchPerformanceData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      await Promise.all([
        fetchDeckPerformance(),
        fetchTagPerformance()
      ]);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeckPerformance = async () => {
    try {
      // Get all flashcard sets for the user
      const { data: sets } = await supabase
        .from('flashcard_sets')
        .select('id, title, created_at')
        .eq('user_id', user!.id);

      if (!sets || sets.length === 0) {
        setDeckPerformance([]);
        return;
      }

      const deckPerformanceData: DeckPerformance[] = [];

      for (const set of sets) {
        // Get cards in this set
        const { data: cards } = await supabase
          .from('flashcards')
          .select('id')
          .eq('set_id', set.id);

        const cardIds = cards?.map(card => card.id) || [];
        
        if (cardIds.length === 0) {
          deckPerformanceData.push({
            setId: set.id,
            setTitle: set.title,
            avgAccuracy: 0,
            totalStudyTime: 0,
            avgEaseFactor: 2.5,
            totalReviews: 0,
            cardCount: 0,
            lastStudied: 'Never'
          });
          continue;
        }

        // Get card reviews for accuracy calculation
        const { data: reviews } = await supabase
          .from('card_reviews')
          .select('score')
          .eq('user_id', user!.id)
          .in('card_id', cardIds);

        // Get study sessions for time calculation
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('total_time_seconds, started_at')
          .eq('user_id', user!.id)
          .eq('set_id', set.id)
          .order('started_at', { ascending: false });

        // Get user card stats for ease factor
        const { data: cardStats } = await supabase
          .from('user_card_stats')
          .select('current_ease_factor, last_reviewed_at')
          .eq('user_id', user!.id)
          .in('card_id', cardIds);

        // Calculate metrics
        const avgAccuracy = reviews && reviews.length > 0 
          ? (reviews.reduce((sum, review) => sum + (review.score >= 3 ? 1 : 0), 0) / reviews.length) * 100
          : 0;

        const totalStudyTime = sessions?.reduce((sum, session) => sum + (session.total_time_seconds || 0), 0) || 0;

        const avgEaseFactor = cardStats && cardStats.length > 0
          ? cardStats.reduce((sum, stat) => sum + (stat.current_ease_factor || 2.5), 0) / cardStats.length
          : 2.5;

        const lastStudied = sessions && sessions.length > 0 
          ? new Date(sessions[0].started_at).toLocaleDateString()
          : 'Never';

        deckPerformanceData.push({
          setId: set.id,
          setTitle: set.title,
          avgAccuracy: Math.round(avgAccuracy),
          totalStudyTime,
          avgEaseFactor: Number(avgEaseFactor.toFixed(2)),
          totalReviews: reviews?.length || 0,
          cardCount: cardIds.length,
          lastStudied
        });
      }

      setDeckPerformance(deckPerformanceData.sort((a, b) => b.totalReviews - a.totalReviews));
    } catch (error) {
      console.error('Error fetching deck performance:', error);
    }
  };

  const fetchTagPerformance = async () => {
    try {
      // For now, we'll create mock tag data since tags aren't implemented in flashcards yet
      // This would be replaced with actual tag-based queries when tags are added to the schema
      const mockTagData: TagPerformance[] = [
        { tag: 'Mathematics', avgAccuracy: 85, totalStudyTime: 3600, avgEaseFactor: 2.8, reviewCount: 120, cardCount: 45 },
        { tag: 'Science', avgAccuracy: 72, totalStudyTime: 2400, avgEaseFactor: 2.3, reviewCount: 95, cardCount: 38 },
        { tag: 'History', avgAccuracy: 91, totalStudyTime: 1800, avgEaseFactor: 3.1, reviewCount: 78, cardCount: 25 },
        { tag: 'Languages', avgAccuracy: 68, totalStudyTime: 4200, avgEaseFactor: 2.1, reviewCount: 156, cardCount: 62 },
        { tag: 'Literature', avgAccuracy: 83, totalStudyTime: 2100, avgEaseFactor: 2.7, reviewCount: 89, cardCount: 31 }
      ];

      setTagPerformance(mockTagData);
    } catch (error) {
      console.error('Error fetching tag performance:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 85) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEaseFactorBadge = (easeFactor: number) => {
    if (easeFactor >= 2.8) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    if (easeFactor >= 2.3) return <Badge variant="secondary">Good</Badge>;
    return <Badge variant="destructive">Needs Work</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">Loading performance data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deck Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Deck Performance Breakdown
          </CardTitle>
          <CardDescription>
            Detailed performance metrics for each of your flashcard decks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deckPerformance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deck performance data available.</p>
              <p className="text-sm">Start studying your decks to see analytics here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deck Name</TableHead>
                    <TableHead>Cards</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Study Time</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Ease Factor</TableHead>
                    <TableHead>Last Studied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deckPerformance.map((deck) => (
                    <TableRow key={deck.setId}>
                      <TableCell className="font-medium">{deck.setTitle}</TableCell>
                      <TableCell>{deck.cardCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={getPerformanceColor(deck.avgAccuracy)}>
                            {deck.avgAccuracy}%
                          </span>
                          <Progress value={deck.avgAccuracy} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{formatTime(deck.totalStudyTime)}</TableCell>
                      <TableCell>{deck.totalReviews}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{deck.avgEaseFactor}</span>
                          {getEaseFactorBadge(deck.avgEaseFactor)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {deck.lastStudied}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tag Performance Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tag Accuracy Performance
            </CardTitle>
            <CardDescription>
              Performance comparison across different content tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tag" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [`${value}%`, 'Accuracy']}
                  />
                  <Bar dataKey="avgAccuracy" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Study Time by Tag
            </CardTitle>
            <CardDescription>
              Time investment across different content areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tag" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [`${Math.round(Number(value) / 60)} minutes`, 'Study Time']}
                  />
                  <Bar dataKey="totalStudyTime" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tag Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tag Performance Overview
          </CardTitle>
          <CardDescription>
            Detailed breakdown of performance metrics by content tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tagPerformance.map((tag) => (
              <div key={tag.tag} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{tag.tag}</h3>
                  <Badge variant="outline">{tag.cardCount} cards</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Accuracy:</span>
                    <span className={getPerformanceColor(tag.avgAccuracy)}>
                      {tag.avgAccuracy}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Study Time:</span>
                    <span>{formatTime(tag.totalStudyTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reviews:</span>
                    <span>{tag.reviewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ease Factor:</span>
                    <span>{tag.avgEaseFactor}</span>
                  </div>
                </div>
                <Progress value={tag.avgAccuracy} className="mt-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
