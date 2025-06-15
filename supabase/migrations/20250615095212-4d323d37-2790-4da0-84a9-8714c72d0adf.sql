
-- Create table for tracking imported content
CREATE TABLE public.imported_content_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  source TEXT NOT NULL, -- 'anki', 'quizlet', 'google_docs', 'pdf', 'csv', 'txt'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'success', 'failed'
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  source_url TEXT, -- for google docs, web sources
  original_filename TEXT, -- for uploaded files
  deck_id UUID REFERENCES flashcard_sets(id),
  cards_imported INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.imported_content_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own import logs
CREATE POLICY "Users can view their own import logs" 
  ON public.imported_content_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import logs" 
  ON public.imported_content_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import logs" 
  ON public.imported_content_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.imported_content_logs 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
