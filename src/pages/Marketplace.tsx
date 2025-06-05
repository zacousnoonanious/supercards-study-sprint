
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Download } from 'lucide-react';
import { UserDropdown } from '@/components/UserDropdown';
import { Navigation } from '@/components/Navigation';

const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const featuredDecks = [
    {
      id: '1',
      title: 'Spanish Vocabulary Essentials',
      description: 'Master the 1000 most common Spanish words',
      author: 'LanguageMaster',
      rating: 4.8,
      downloads: 2143,
      price: 'Free'
    },
    {
      id: '2',
      title: 'Medical Terminology',
      description: 'Complete medical terminology for healthcare professionals',
      author: 'DrMedStudy',
      rating: 4.9,
      downloads: 1876,
      price: '$9.99'
    },
    {
      id: '3',
      title: 'JavaScript Fundamentals',
      description: 'Core JavaScript concepts and methods',
      author: 'CodeAcademy',
      rating: 4.7,
      downloads: 3421,
      price: 'Free'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="shadow-sm border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-indigo-600">SuperCards</h1>
              <Navigation />
            </div>
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Marketplace</h2>
          <p className="text-muted-foreground">Discover and download high-quality flashcard decks created by the community.</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Featured Decks</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredDecks.map(deck => (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{deck.title}</CardTitle>
                  <CardDescription>{deck.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>by {deck.author}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{deck.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        <span>{deck.downloads} downloads</span>
                      </div>
                      <span className="font-semibold text-foreground">{deck.price}</span>
                    </div>
                    <Button className="w-full">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {deck.price === 'Free' ? 'Download' : 'Purchase'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="text-center py-12 bg-muted/50">
          <CardContent>
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">More decks coming soon!</h3>
            <p className="text-muted-foreground mb-4">
              The marketplace is currently in development. Soon you'll be able to browse, purchase, and share flashcard decks with the community.
            </p>
            <Button onClick={() => navigate('/decks')}>
              Browse Your Decks
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Marketplace;
