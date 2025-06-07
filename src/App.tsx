
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Decks from '@/pages/Decks';
import CreateSet from '@/pages/CreateSet';
import SetView from '@/pages/SetView';
import AddCard from '@/pages/AddCard';
import StudyMode from '@/pages/StudyMode';
import Profile from '@/pages/Profile';
import Marketplace from '@/pages/Marketplace';
import CardEditorPage from '@/pages/CardEditorPage';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <I18nProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/decks" element={<Decks />} />
                  <Route path="/create-set" element={<CreateSet />} />
                  <Route path="/sets/:setId" element={<SetView />} />
                  <Route path="/sets/:setId/add-card" element={<AddCard />} />
                  <Route path="/sets/:setId/cards/:cardId" element={<CardEditorPage />} />
                  <Route path="/edit-cards/:setId" element={<CardEditorPage />} />
                  <Route path="/sets/:setId/study" element={<StudyMode />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
            </Router>
          </I18nProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
