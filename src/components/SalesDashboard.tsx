
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Download, Star, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SalesData {
  id: string;
  title: string;
  description: string;
  price: number;
  total_downloads: number;
  rating: number;
  rating_count: number;
  is_active: boolean;
  created_at: string;
  total_revenue: number;
}

export const SalesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSalesData();
    }
  }, [user]);

  const fetchSalesData = async () => {
    if (!user) return;

    try {
      // Fetch marketplace decks created by the user
      const { data: decks, error: decksError } = await supabase
        .from('marketplace_decks')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (decksError) throw decksError;

      // Fetch purchase data for revenue calculation
      if (decks && decks.length > 0) {
        const deckIds = decks.map(deck => deck.id);
        const { data: purchases, error: purchasesError } = await supabase
          .from('marketplace_purchases')
          .select('marketplace_deck_id, purchase_price')
          .in('marketplace_deck_id', deckIds)
          .eq('status', 'completed');

        if (purchasesError) throw purchasesError;

        // Calculate revenue per deck
        const revenueByDeck = purchases?.reduce((acc, purchase) => {
          acc[purchase.marketplace_deck_id] = (acc[purchase.marketplace_deck_id] || 0) + purchase.purchase_price;
          return acc;
        }, {} as Record<string, number>) || {};

        const salesDataWithRevenue = decks.map(deck => ({
          ...deck,
          total_revenue: revenueByDeck[deck.id] || 0
        }));

        setSalesData(salesDataWithRevenue);
        setTotalRevenue(Object.values(revenueByDeck).reduce((sum, revenue) => sum + revenue, 0));
      } else {
        setSalesData([]);
        setTotalRevenue(0);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('Failed to load sales data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (deckId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('marketplace_decks')
        .update({ is_active: !currentStatus })
        .eq('id', deckId);

      if (error) throw error;

      toast.success(`Deck ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchSalesData();
    } catch (error) {
      console.error('Error updating deck status:', error);
      toast.error('Failed to update deck status');
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_decks')
        .delete()
        .eq('id', deckId);

      if (error) throw error;

      toast.success('Deck listing deleted successfully');
      fetchSalesData();
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Failed to delete deck listing');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading sales data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesData.filter(deck => deck.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesData.reduce((sum, deck) => sum + deck.total_downloads, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Marketplace Listings</h3>
        
        {salesData.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">You haven't listed any decks for sale yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Go to any of your decks and click "List for Sale" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          salesData.map(deck => (
            <Card key={deck.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {deck.title}
                      <Badge variant={deck.is_active ? "default" : "secondary"}>
                        {deck.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{deck.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(deck.id, deck.is_active)}
                    >
                      {deck.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDeck(deck.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-semibold">
                      {deck.price === 0 ? 'Free' : `$${deck.price}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Downloads</p>
                    <p className="font-semibold">{deck.total_downloads}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {deck.rating || 0} ({deck.rating_count || 0})
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-semibold">${deck.total_revenue.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
