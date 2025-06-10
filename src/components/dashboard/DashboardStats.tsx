
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Clock, TrendingUp } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface DashboardStatsProps {
  stats?: {
    totalDecks: number;
    totalCards: number;
    studyStreak: number;
    cardsReviewed: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const { t } = useI18n();

  if (!stats) return null;

  const statItems = [
    { title: t('decks.title'), value: stats.totalDecks, icon: BookOpen },
    { title: t('dashboard.totalCards'), value: stats.totalCards, icon: Brain },
    { title: t('dashboard.studyStreak'), value: `${stats.studyStreak} ${t('dashboard.days')}`, icon: TrendingUp },
    { title: t('dashboard.cardsReviewed'), value: stats.cardsReviewed, subtitle: t('dashboard.thisWeek'), icon: Clock }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {statItems.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.subtitle && <p className="text-xs text-muted-foreground">{stat.subtitle}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
