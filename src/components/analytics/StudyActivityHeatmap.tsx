
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfYear, endOfYear, eachDayOfInterval, subDays, isToday, isSameDay } from 'date-fns';

interface StudyActivity {
  date: string;
  sessions: number;
  totalTime: number;
  cardsReviewed: number;
}

interface HeatmapDay {
  date: Date;
  sessions: number;
  totalTime: number;
  level: number; // 0-4 for intensity
}

export const StudyActivityHeatmap: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('365');
  const [studyActivity, setStudyActivity] = useState<StudyActivity[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudyActivity();
    }
  }, [user, timeRange]);

  const fetchStudyActivity = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const daysBack = parseInt(timeRange);
      const startDate = subDays(new Date(), daysBack).toISOString().split('T')[0];

      // Fetch study sessions grouped by date
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('started_at, total_time_seconds, cards_reviewed')
        .eq('user_id', user.id)
        .gte('started_at', startDate)
        .order('started_at', { ascending: true });

      if (!sessions) return;

      // Group sessions by date
      const activityMap = new Map<string, StudyActivity>();
      
      sessions.forEach(session => {
        const date = new Date(session.started_at).toISOString().split('T')[0];
        const existing = activityMap.get(date) || {
          date,
          sessions: 0,
          totalTime: 0,
          cardsReviewed: 0
        };

        activityMap.set(date, {
          date,
          sessions: existing.sessions + 1,
          totalTime: existing.totalTime + (session.total_time_seconds || 0),
          cardsReviewed: existing.cardsReviewed + (session.cards_reviewed || 0)
        });
      });

      const activityArray = Array.from(activityMap.values());
      setStudyActivity(activityArray);

      // Generate heatmap data for the full year
      generateHeatmapData(activityMap);

    } catch (error) {
      console.error('Error fetching study activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmapData = (activityMap: Map<string, StudyActivity>) => {
    const currentYear = new Date().getFullYear();
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));
    
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
    
    // Calculate max sessions for normalization
    const maxSessions = Math.max(...Array.from(activityMap.values()).map(a => a.sessions), 1);
    
    const heatmapDays = allDays.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const activity = activityMap.get(dateStr);
      
      const sessions = activity?.sessions || 0;
      const totalTime = activity?.totalTime || 0;
      
      // Calculate intensity level (0-4)
      let level = 0;
      if (sessions > 0) {
        const intensity = sessions / maxSessions;
        if (intensity > 0.75) level = 4;
        else if (intensity > 0.5) level = 3;
        else if (intensity > 0.25) level = 2;
        else level = 1;
      }
      
      return {
        date,
        sessions,
        totalTime,
        level
      };
    });
    
    setHeatmapData(heatmapDays);
  };

  const getIntensityColor = (level: number) => {
    const colors = [
      'bg-muted', // 0 - no activity
      'bg-green-200', // 1 - low
      'bg-green-400', // 2 - medium
      'bg-green-600', // 3 - high
      'bg-green-800'  // 4 - very high
    ];
    return colors[level] || colors[0];
  };

  const formatTimelineData = () => {
    return studyActivity.map(activity => ({
      date: format(new Date(activity.date), 'MMM dd'),
      studyTime: Math.round(activity.totalTime / 60), // Convert to minutes
      sessions: activity.sessions,
      cardsReviewed: activity.cardsReviewed
    }));
  };

  const renderHeatmapGrid = () => {
    const weeks: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];
    
    heatmapData.forEach((day, index) => {
      currentWeek.push(day);
      
      if (day.date.getDay() === 6 || index === heatmapData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return (
      <div className="flex gap-1 overflow-x-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date.toISOString()}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(day.level)} hover:ring-2 hover:ring-primary cursor-pointer transition-all`}
                title={`${format(day.date, 'MMM dd, yyyy')}: ${day.sessions} sessions, ${Math.round(day.totalTime / 60)}min`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const totalSessions = studyActivity.reduce((sum, day) => sum + day.sessions, 0);
  const totalMinutes = Math.round(studyActivity.reduce((sum, day) => sum + day.totalTime, 0) / 60);
  const activeDays = studyActivity.filter(day => day.sessions > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading activity data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Study Activity</h2>
          <p className="text-muted-foreground">Your learning consistency over time</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Across {activeDays} active days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMinutes}m</div>
            <p className="text-xs text-muted-foreground">
              {activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0}m average per active day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((activeDays / parseInt(timeRange)) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Days with study activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Study Activity Heatmap
          </CardTitle>
          <CardDescription>
            Daily study sessions throughout the year - darker squares indicate more activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {renderHeatmapGrid()}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Study Time Timeline</CardTitle>
          <CardDescription>Daily study time over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatTimelineData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === 'studyTime' ? `${value} minutes` : value,
                    name === 'studyTime' ? 'Study Time' : 'Sessions'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="studyTime" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
