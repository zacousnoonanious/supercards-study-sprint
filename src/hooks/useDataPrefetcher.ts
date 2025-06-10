
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useDataPrefetcher = (userId?: string) => {
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    if (!userId) return;

    const prefetchData = async () => {
      const currentPath = location.pathname;

      // Prefetch user's decks on dashboard or main pages
      if (['/dashboard', '/decks', '/'].includes(currentPath)) {
        queryClient.prefetchQuery({
          queryKey: ['flashcard_sets', userId],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('flashcard_sets')
              .select('*')
              .eq('user_id', userId)
              .order('updated_at', { ascending: false });
            
            if (error) throw error;
            return data;
          },
          staleTime: 2 * 60 * 1000, // 2 minutes
        });
      }

      // Prefetch cards when on set view
      if (currentPath.includes('/sets/')) {
        const setId = currentPath.split('/sets/')[1]?.split('/')[0];
        if (setId) {
          queryClient.prefetchQuery({
            queryKey: ['flashcards', setId],
            queryFn: async () => {
              const { data, error } = await supabase
                .from('flashcards')
                .select('*')
                .eq('set_id', setId)
                .order('created_at', { ascending: true });
              
              if (error) throw error;
              return data;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
          });
        }
      }
    };

    // Small delay to not interfere with current page load
    const timer = setTimeout(prefetchData, 50);
    return () => clearTimeout(timer);
  }, [location.pathname, userId, queryClient]);
};
