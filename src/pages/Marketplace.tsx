
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';

interface MarketplaceSet {
  id: string;
  title: string;
  description: string;
  author: string;
  rating: number;
  downloads: number;
  category: string;
  price: number;
  preview_url?: string;
}

const Marketplace = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredSets] = useState<MarketplaceSet[]>([
    {
      id: '1',
      title: 'Spanish Vocabulary - Beginner',
      description: 'Essential Spanish words and phrases for beginners',
      author: 'Maria Garcia',
      rating: 4.8,
      downloads: 1250,
      category: 'Language',
      price: 0
    },
    {
      id: '2',
      title: 'Biology - Cell Structure',
      description: 'Comprehensive study of cellular biology',
      author: 'Dr. Johnson',
      rating: 4.6,
      downloads: 890,
      category: 'Science',
      price: 4.99
    },
    {
      id: '3',
      title: 'Programming Concepts',
      description: 'Fundamental programming concepts and terminology',
      author: 'CodeMaster',
      rating: 4.9,
      downloads: 2100,
      category: 'Technology',
      price: 0
    }
  ]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const filteredSets = featuredSets.filter(set =>
    set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">{t('marketplace.title')}</h2>
          <p className="text-muted-foreground">{t('marketplace.subtitle')}</p>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder={t('marketplace.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">{t('marketplace.featured')}</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSets.map(set => (
              <Card key={set.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{set.title}</CardTitle>
                      <CardDescription className="mt-1">{set.description}</CardDescription>
                    </div>
                    <Badge variant={set.price === 0 ? "secondary" : "default"}>
                      {set.price === 0 ? t('marketplace.free') : `$${set.price}`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{t('marketplace.by')} {set.author}</span>
                      <Badge variant="outline">{set.category}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{set.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-muted-foreground" />
                        <span>{set.downloads.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        {t('marketplace.preview')}
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-1" />
                        {t('marketplace.download')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredSets.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-foreground mb-2">{t('marketplace.noResults')}</h3>
            <p className="text-muted-foreground">{t('marketplace.noResultsMessage')}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;
