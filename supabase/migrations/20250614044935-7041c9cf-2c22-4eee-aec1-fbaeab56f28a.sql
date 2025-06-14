
-- Create marketplace_decks table to track decks available for sale
CREATE TABLE public.marketplace_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID REFERENCES public.flashcard_sets(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  category TEXT,
  tags TEXT[],
  preview_card_count INTEGER DEFAULT 3,
  total_downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create marketplace_purchases table to track user purchases
CREATE TABLE public.marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  marketplace_deck_id UUID REFERENCES public.marketplace_decks(id) ON DELETE CASCADE NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(buyer_id, marketplace_deck_id)
);

-- Create marketplace_reviews table for deck reviews
CREATE TABLE public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_deck_id UUID REFERENCES public.marketplace_decks(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(marketplace_deck_id, reviewer_id)
);

-- Enable RLS on all marketplace tables
ALTER TABLE public.marketplace_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_decks
CREATE POLICY "Anyone can view active marketplace decks" ON public.marketplace_decks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own marketplace decks" ON public.marketplace_decks
  FOR ALL USING (seller_id = auth.uid());

-- RLS Policies for marketplace_purchases  
CREATE POLICY "Users can view their own purchases" ON public.marketplace_purchases
  FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Users can create purchases" ON public.marketplace_purchases
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers can view purchases of their decks" ON public.marketplace_purchases
  FOR SELECT USING (
    marketplace_deck_id IN (
      SELECT id FROM public.marketplace_decks WHERE seller_id = auth.uid()
    )
  );

-- RLS Policies for marketplace_reviews
CREATE POLICY "Anyone can view reviews" ON public.marketplace_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reviews" ON public.marketplace_reviews
  FOR ALL USING (reviewer_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_marketplace_decks_category ON public.marketplace_decks(category);
CREATE INDEX idx_marketplace_decks_price ON public.marketplace_decks(price);
CREATE INDEX idx_marketplace_decks_rating ON public.marketplace_decks(rating);
CREATE INDEX idx_marketplace_decks_featured ON public.marketplace_decks(featured);
CREATE INDEX idx_marketplace_purchases_buyer ON public.marketplace_purchases(buyer_id);
CREATE INDEX idx_marketplace_reviews_deck ON public.marketplace_reviews(marketplace_deck_id);

-- Add trigger to update marketplace_decks.updated_at
CREATE TRIGGER update_marketplace_decks_updated_at
  BEFORE UPDATE ON public.marketplace_decks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
