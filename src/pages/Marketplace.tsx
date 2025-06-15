import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Download, Eye, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarketplaceDeck {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  rating: number;
  rating_count: number;
  total_downloads: number;
  seller_id: string;
  preview_card_count: number;
  seller_name?: string;
}

const Marketplace = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [decks, setDecks] = useState<MarketplaceDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMarketplaceDecks();
  }, [user, navigate]);

  const fetchMarketplaceDecks = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log('Fetching marketplace decks...');
      
      // First, get the marketplace decks
      const { data: marketplaceDecks, error: decksError } = await supabase
        .from('marketplace_decks')
        .select('*')
        .eq('is_active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (decksError) {
        console.error('Error fetching marketplace decks:', decksError);
        throw decksError;
      }

      console.log('Marketplace decks fetched:', marketplaceDecks?.length || 0);

      if (!marketplaceDecks || marketplaceDecks.length === 0) {
        setDecks([]);
        return;
      }

      // Get unique seller IDs
      const sellerIds = [...new Set(marketplaceDecks.map(deck => deck.seller_id))];
      console.log('Fetching profiles for seller IDs:', sellerIds);

      // Fetch seller profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', sellerIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Don't throw here, just continue without seller names
      }

      console.log('Profiles fetched:', profiles?.length || 0);

      // Combine the data
      const decksWithSellerNames = marketplaceDecks.map(deck => {
        const profile = profiles?.find(p => p.id === deck.seller_id);
        return {
          ...deck,
          seller_name: profile 
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Seller'
            : 'Unknown Seller'
        };
      });

      setDecks(decksWithSellerNames);
      console.log('Final decks set:', decksWithSellerNames.length);
    } catch (error) {
      console.error('Error fetching marketplace decks:', error);
      setError('Failed to load marketplace decks');
      toast.error('Failed to load marketplace decks');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (deckId: string, price: number) => {
    if (!user) return;

    try {
      console.log('Purchasing deck:', deckId, 'for price:', price);
      
      // For now, simulate a purchase - in production you'd integrate with Stripe
      const { error } = await supabase
        .from('marketplace_purchases')
        .insert({
          buyer_id: user.id,
          marketplace_deck_id: deckId,
          purchase_price: price,
          status: 'completed'
        });

      if (error) {
        console.error('Purchase error:', error);
        throw error;
      }

      // Update download count manually
      const { data: currentDeck } = await supabase
        .from('marketplace_decks')
        .select('total_downloads')
        .eq('id', deckId)
        .single();

      if (currentDeck) {
        await supabase
          .from('marketplace_decks')
          .update({ total_downloads: currentDeck.total_downloads + 1 })
          .eq('id', deckId);
      }

      toast.success('Deck purchased successfully!');
      // Refresh the data to show updated download count
      fetchMarketplaceDecks();
    } catch (error: any) {
      console.error('Error purchasing deck:', error);
      if (error.code === '23505') {
        toast.error('You have already purchased this deck');
      } else {
        toast.error('Failed to purchase deck');
      }
    }
  };

  const filteredDecks = decks.filter(deck => {
    const matchesSearch = deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || deck.category === categoryFilter;
    
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'free' && deck.price === 0) ||
                        (priceFilter === 'paid' && deck.price > 0);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const categories = [...new Set(decks.map(deck => deck.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading marketplace...</h2>
            <p className="text-muted-foreground">Please wait while we fetch the latest decks</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Marketplace</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchMarketplaceDecks}>Try Again</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">{t('marketplace.title')}</h2>
          <p className="text-muted-foreground">{t('marketplace.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder={t('marketplace.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deck Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDecks.map(deck => (
            <Card key={deck.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{deck.title}</CardTitle>
                    <CardDescription className="mt-1">{deck.description}</CardDescription>
                  </div>
                  <Badge variant={deck.price === 0 ? "secondary" : "default"}>
                    {deck.price === 0 ? t('marketplace.free') : `$${deck.price}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{t('marketplace.by')} {deck.seller_name}</span>
                    {deck.category && <Badge variant="outline">{deck.category}</Badge>}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{deck.rating || 0} ({deck.rating_count || 0})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <span>{deck.total_downloads.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      {t('marketplace.preview')}
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePurchase(deck.id, deck.price)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {deck.price === 0 ? t('marketplace.download') : 'Buy'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDecks.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? t('marketplace.noResults') : 'No decks available'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? t('marketplace.noResultsMessage') : 'Be the first to list a deck for sale!'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;
