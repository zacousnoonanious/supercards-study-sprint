
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Brain, TrendingDown, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface HardestCard {
  cardId: string;
  question: string;
  answer: string;
  setTitle: string;
  easeFactor: number;
  totalReviews: number;
  correctReviews: number;
  accuracy: number;
  lastReviewed: string;
  nextReview: string;
}

interface ConceptMetric {
  concept: string;
  avgAccuracy: number;
  avgEaseFactor: number;
  totalCards: number;
  totalReviews: number;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
}

export const CardDifficultyAnalysis: React.FC = () => {
  const { user } = useAuth();
  const [hardestCards, setHardestCards] = useState<HardestCard[]>([]);
  const [conceptMetrics, setConceptMetrics] = useState<ConceptMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSet, setFilterSet] = useState<string>('all');
  const [availableSets, setAvailableSets] = useState<Array<{id: string, title: string}>>([]);

  useEffect(() => {
    if (user) {
      fetchDifficultyData();
      fetchAvailableSets();
    }
  }, [user, filterSet]);

  const fetchAvailableSets = async () => {
    if (!user) return;

    try {
      const { data: sets } = await supabase
        .from('flashcard_sets')
        .select('id, title')
        .eq('user_id', user.id)
        .order('title');

      setAvailableSets(sets || []);
    } catch (error) {
      console.error('Error fetching available sets:', error);
    }
  };

  const fetchDifficultyData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      await Promise.all([
        fetchHardestCards(),
        fetchConceptMetrics()
      ]);
    } catch (error) {
      console.error('Error fetching difficulty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHardestCards = async () => {
    try {
      let query = supabase
        .from('user_card_stats')
        .select(`
          card_id,
          current_ease_factor,
          total_reviews,
          correct_reviews,
          last_reviewed_at,
          next_review_date,
          flashcards!inner(
            question,
            answer,
            set_id,
            flashcard_sets!inner(
              title
            )
          )
        `)
        .eq('user_id', user!.id)
        .gt('total_reviews', 2); // Only include cards with meaningful data

      if (filterSet !== 'all') {
        query = query.eq('flashcards.set_id', filterSet);
      }

      const { data: cardStats } = await query
        .order('current_ease_factor', { ascending: true })
        .limit(20);

      if (!cardStats) {
        setHardestCards([]);
        return;
      }

      const hardestCards = cardStats.map(stat => {
        const accuracy = stat.total_reviews > 0 ? (stat.correct_reviews / stat.total_reviews) * 100 : 0;
        return {
          cardId: stat.card_id,
          question: stat.flashcards.question.length > 50 
            ? stat.flashcards.question.substring(0, 50) + '...'
            : stat.flashcards.question,
          answer: stat.flashcards.answer.length > 50 
            ? stat.flashcards.answer.substring(0, 50) + '...'
            : stat.flashcards.answer,
          setTitle: stat.flashcards.flashcard_sets.title,
          easeFactor: stat.current_ease_factor || 2.5,
          totalReviews: stat.total_reviews,
          correctReviews: stat.correct_reviews,
          accuracy: Math.round(accuracy),
          lastReviewed: stat.last_reviewed_at ? new Date(stat.last_reviewed_at).toLocaleDateString() : 'Never',
          nextReview: stat.next_review_date ? new Date(stat.next_review_date).toLocaleDateString() : 'Not scheduled'
        };
      });

      setHardestCards(hardestCards);
    } catch (error) {
      console.error('Error fetching hardest cards:', error);
    }
  };

  const fetchConceptMetrics = async () => {
    try {
      // Since we don't have tags implemented yet, we'll group by deck as a proxy for concepts
      let query = supabase
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
        .eq('user_id', user!.id)
        .gt('total_reviews', 0);

      if (filterSet !== 'all') {
        query = query.eq('flashcards.set_id', filterSet);
      }

      const { data: cardStats } = await query;

      if (!cardStats) {
        setConceptMetrics([]);
        return;
      }

      // Group by deck (concept proxy)
      const conceptGroups = cardStats.reduce((acc, stat) => {
        const concept = stat.flashcards.flashcard_sets.title;
        
        if (!acc[concept]) {
          acc[concept] = {
            totalAccuracy: 0,
            totalEaseFactor: 0,
            totalCards: 0,
            totalReviews: 0
          };
        }

        const accuracy = stat.total_reviews > 0 ? (stat.correct_reviews / stat.total_reviews) * 100 : 0;
        acc[concept].totalAccuracy += accuracy;
        acc[concept].totalEaseFactor += stat.current_ease_factor || 2.5;
        acc[concept].totalCards += 1;
        acc[concept].totalReviews += stat.total_reviews;

        return acc;
      }, {} as any);

      const conceptMetrics = Object.entries(conceptGroups).map(([concept, data]: [string, any]) => {
        const avgAccuracy = data.totalAccuracy / data.totalCards;
        const avgEaseFactor = data.totalEaseFactor / data.totalCards;
        
        let difficultyLevel: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
        if (avgAccuracy >= 85 && avgEaseFactor >= 2.8) difficultyLevel = 'Easy';
        else if (avgAccuracy >= 70 && avgEaseFactor >= 2.3) difficultyLevel = 'Medium';
        else if (avgAccuracy >= 55 && avgEaseFactor >= 1.8) difficultyLevel = 'Hard';
        else difficultyLevel = 'Very Hard';

        return {
          concept,
          avgAccuracy: Math.round(avgAccuracy),
          avgEaseFactor: Number(avgEaseFactor.toFixed(2)),
          totalCards: data.totalCards,
          totalReviews: data.totalReviews,
          difficultyLevel
        };
      });

      // Sort by difficulty (lowest accuracy first)
      conceptMetrics.sort((a, b) => a.avgAccuracy - b.avgAccuracy);
      setConceptMetrics(conceptMetrics);
    } catch (error) {
      console.error('Error fetching concept metrics:', error);
    }
  };

  const getDifficultyBadge = (easeFactor: number, accuracy: number) => {
    if (accuracy >= 85 && easeFactor >= 2.8) return <Badge variant="default" className="bg-green-100 text-green-800">Easy</Badge>;
    if (accuracy >= 70 && easeFactor >= 2.3) return <Badge variant="secondary">Medium</Badge>;
    if (accuracy >= 55 && easeFactor >= 1.8) return <Badge variant="outline" className="border-orange-500 text-orange-700">Hard</Badge>;
    return <Badge variant="destructive">Very Hard</Badge>;
  };

  const getConceptDifficultyBadge = (level: string) => {
    switch (level) {
      case 'Easy': return <Badge variant="default" className="bg-green-100 text-green-800">Easy</Badge>;
      case 'Medium': return <Badge variant="secondary">Medium</Badge>;
      case 'Hard': return <Badge variant="outline" className="border-orange-500 text-orange-700">Hard</Badge>;
      case 'Very Hard': return <Badge variant="destructive">Very Hard</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">Loading difficulty analysis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Difficulty Analysis Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Filter by Deck:</label>
              <Select value={filterSet} onValueChange={setFilterSet}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Decks</SelectItem>
                  {availableSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      {set.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hardest Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Hardest Cards
          </CardTitle>
          <CardDescription>
            Cards with the lowest ease factors and accuracy rates that need the most attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hardestCards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No difficult cards found.</p>
              <p className="text-sm">Keep studying to generate difficulty data!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Deck</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Ease Factor</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Last Reviewed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hardestCards.map((card) => (
                    <TableRow key={card.cardId}>
                      <TableCell className="max-w-[200px]">
                        <div className="font-medium">{card.question}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {card.answer}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{card.setTitle}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={card.accuracy < 60 ? 'text-red-600' : card.accuracy < 80 ? 'text-yellow-600' : 'text-green-600'}>
                            {card.accuracy}%
                          </span>
                          <Progress value={card.accuracy} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={card.easeFactor < 2.0 ? 'text-red-600' : card.easeFactor < 2.5 ? 'text-yellow-600' : 'text-green-600'}>
                          {card.easeFactor}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {card.correctReviews}/{card.totalReviews}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getDifficultyBadge(card.easeFactor, card.accuracy)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {card.lastReviewed}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Concepts Performance Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Concept Difficulty Overview
            </CardTitle>
            <CardDescription>
              Average accuracy by concept/deck
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conceptMetrics.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="concept" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [`${value}%`, 'Accuracy']}
                  />
                  <Bar 
                    dataKey="avgAccuracy" 
                    fill={(entry) => {
                      const acc = entry.avgAccuracy;
                      if (acc >= 85) return '#22c55e'; // green
                      if (acc >= 70) return '#eab308'; // yellow
                      if (acc >= 55) return '#f97316'; // orange
                      return '#ef4444'; // red
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Ease Factor Distribution
            </CardTitle>
            <CardDescription>
              Average ease factors by concept
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conceptMetrics.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="concept" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis domain={[1, 4]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avgEaseFactor" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Concepts Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Concept Performance Summary
          </CardTitle>
          <CardDescription>
            Detailed performance metrics grouped by concept/deck
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conceptMetrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No concept data available.</p>
              <p className="text-sm">Study more cards to see concept-based analytics!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concept/Deck</TableHead>
                    <TableHead>Cards</TableHead>
                    <TableHead>Avg Accuracy</TableHead>
                    <TableHead>Avg Ease Factor</TableHead>
                    <TableHead>Total Reviews</TableHead>
                    <TableHead>Difficulty Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conceptMetrics.map((concept) => (
                    <TableRow key={concept.concept}>
                      <TableCell className="font-medium">{concept.concept}</TableCell>
                      <TableCell>{concept.totalCards}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={concept.avgAccuracy < 60 ? 'text-red-600' : concept.avgAccuracy < 80 ? 'text-yellow-600' : 'text-green-600'}>
                            {concept.avgAccuracy}%
                          </span>
                          <Progress value={concept.avgAccuracy} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{concept.avgEaseFactor}</TableCell>
                      <TableCell>{concept.totalReviews}</TableCell>
                      <TableCell>
                        {getConceptDifficultyBadge(concept.difficultyLevel)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
