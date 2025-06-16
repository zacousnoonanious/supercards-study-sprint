
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trophy, Medal, Award, Clock, BookOpen, Zap, Users, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  total_study_time_seconds: number;
  total_cards_reviewed: number;
  last_study_date: string | null;
  streak_rank: number;
  cards_rank: number;
  time_rank: number;
  overall_score: number;
}

interface UserPosition {
  streak_position: number;
  cards_position: number;
  time_position: number;
  overall_position: number;
  total_users: number;
}

export const LeaderboardDisplay: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [showInLeaderboard, setShowInLeaderboard] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');

  useEffect(() => {
    if (user) {
      fetchLeaderboardData();
      fetchUserPosition();
      fetchUserPrivacySettings();
    }
  }, [user]);

  const fetchLeaderboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .order('overall_score', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchUserPosition = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_leaderboard_position', { p_user_id: user.id });

      if (error) throw error;
      if (data && data.length > 0) {
        setUserPosition(data[0]);
      }
    } catch (error) {
      console.error('Error fetching user position:', error);
    }
  };

  const fetchUserPrivacySettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('show_in_leaderboard')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setShowInLeaderboard(data?.show_in_leaderboard ?? true);
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySettings = async (showInLeaderboard: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ show_in_leaderboard: showInLeaderboard })
        .eq('id', user.id);

      if (error) throw error;

      setShowInLeaderboard(showInLeaderboard);
      toast({
        title: 'Privacy settings updated',
        description: showInLeaderboard 
          ? 'You will now appear on the leaderboard'
          : 'You have been removed from the leaderboard'
      });

      // Refresh data
      await Promise.all([fetchLeaderboardData(), fetchUserPosition()]);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update privacy settings',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">#{rank}</Badge>;
    if (rank <= 10) return <Badge variant="secondary">#{rank}</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const sortLeaderboard = (metric: string) => {
    const sorted = [...leaderboard].sort((a, b) => {
      switch (metric) {
        case 'streak':
          return b.current_streak - a.current_streak;
        case 'cards':
          return b.total_cards_reviewed - a.total_cards_reviewed;
        case 'time':
          return b.total_study_time_seconds - a.total_study_time_seconds;
        default:
          return b.overall_score - a.overall_score;
      }
    });
    return sorted;
  };

  const isCurrentUser = (entryId: string) => user?.id === entryId;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {showInLeaderboard ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            Leaderboard Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show me on the leaderboard</p>
              <p className="text-sm text-muted-foreground">
                Your stats will be visible to other users when enabled
              </p>
            </div>
            <Switch
              checked={showInLeaderboard}
              onCheckedChange={updatePrivacySettings}
            />
          </div>
        </CardContent>
      </Card>

      {/* User Position Summary */}
      {userPosition && showInLeaderboard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Rankings
            </CardTitle>
            <CardDescription>Your position among {userPosition.total_users} active users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">#{userPosition.overall_position}</div>
                <p className="text-sm text-muted-foreground">Overall</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">#{userPosition.streak_position}</div>
                <p className="text-sm text-muted-foreground">Streak</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">#{userPosition.cards_position}</div>
                <p className="text-sm text-muted-foreground">Cards</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">#{userPosition.time_position}</div>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <CardDescription>Top performers in the community</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="streak">Streak</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="time">Time</TabsTrigger>
            </TabsList>

            <TabsContent value="overall" className="mt-4">
              <LeaderboardTable 
                data={sortLeaderboard('overall')} 
                metric="overall_score"
                metricLabel="Score"
                icon={<Trophy className="h-4 w-4" />}
                formatValue={(value) => Math.round(value).toLocaleString()}
                currentUserId={user?.id}
              />
            </TabsContent>

            <TabsContent value="streak" className="mt-4">
              <LeaderboardTable 
                data={sortLeaderboard('streak')} 
                metric="current_streak"
                metricLabel="Current Streak"
                icon={<Zap className="h-4 w-4" />}
                formatValue={(value) => `${value} days`}
                currentUserId={user?.id}
              />
            </TabsContent>

            <TabsContent value="cards" className="mt-4">
              <LeaderboardTable 
                data={sortLeaderboard('cards')} 
                metric="total_cards_reviewed"
                metricLabel="Cards Reviewed"
                icon={<BookOpen className="h-4 w-4" />}
                formatValue={(value) => value.toLocaleString()}
                currentUserId={user?.id}
              />
            </TabsContent>

            <TabsContent value="time" className="mt-4">
              <LeaderboardTable 
                data={sortLeaderboard('time')} 
                metric="total_study_time_seconds"
                metricLabel="Study Time"
                icon={<Clock className="h-4 w-4" />}
                formatValue={formatTime}
                currentUserId={user?.id}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  metric: keyof LeaderboardEntry;
  metricLabel: string;
  icon: React.ReactNode;
  formatValue: (value: any) => string;
  currentUserId?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  data,
  metric,
  metricLabel,
  icon,
  formatValue,
  currentUserId
}) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">#{rank}</Badge>;
    if (rank <= 10) return <Badge variant="secondary">#{rank}</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="flex items-center gap-2">
              {icon}
              {metricLabel}
            </TableHead>
            <TableHead>Last Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 20).map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = currentUserId === entry.id;
            
            return (
              <TableRow 
                key={entry.id}
                className={isCurrentUser ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRankIcon(rank)}
                    {getRankBadge(rank)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback>
                        {entry.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {entry.display_name}
                        {isCurrentUser && (
                          <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatValue(entry[metric] as any)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.last_study_date 
                    ? new Date(entry.last_study_date).toLocaleDateString()
                    : 'Never'
                  }
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
