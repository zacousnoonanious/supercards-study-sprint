
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSets();
  }, [user, navigate]);

  const fetchSets = async () => {
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSets(data || []);
    } catch (error) {
      console.error('Error fetching sets:', error);
      toast({
        title: "Error",
        description: "Failed to load your flashcard sets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSets(sets.filter(set => set.id !== id));
      toast({
        title: "Success",
        description: "Flashcard set deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting set:', error);
      toast({
        title: "Error",
        description: "Failed to delete flashcard set.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600">SuperCards</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{t('welcome')}, {user?.email}</span>
              <Button variant="outline" onClick={() => navigate('/profile')}>
                {t('nav.profile')}
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                {t('nav.signOut')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.title')}</h2>
          <Button onClick={() => navigate('/create-set')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('nav.createSet')}
          </Button>
        </div>

        {sets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.noSets')}</h3>
              <p className="text-gray-600 mb-4">{t('dashboard.noSetsDesc')}</p>
              <Button onClick={() => navigate('/create-set')}>
                {t('dashboard.createFirst')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sets.map((set) => (
              <Card key={set.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{set.title}</span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/edit-set/${set.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSet(set.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>{set.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/set/${set.id}`)}
                      className="flex-1 mr-2"
                    >
                      {t('dashboard.viewCards')}
                    </Button>
                    <Button
                      onClick={() => navigate(`/study/${set.id}`)}
                      className="flex-1 ml-2"
                    >
                      {t('dashboard.study')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
