
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import CreateSet from '@/pages/CreateSet';
import SetView from '@/pages/SetView';
import CardEditorPage from '@/pages/CardEditorPage';
import StudyMode from '@/pages/StudyMode';
import Decks from '@/pages/Decks';
import JoinDeck from '@/pages/JoinDeck';
import Profile from '@/pages/Profile';
import Marketplace from '@/pages/Marketplace';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <OrganizationProvider>
              <I18nProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/create-set" element={<ProtectedRoute><CreateSet /></ProtectedRoute>} />
                  <Route path="/set/:id" element={<ProtectedRoute><SetView /></ProtectedRoute>} />
                  <Route path="/editor/:setId/:cardId?" element={<ProtectedRoute><CardEditorPage /></ProtectedRoute>} />
                  <Route path="/study/:id" element={<ProtectedRoute><StudyMode /></ProtectedRoute>} />
                  <Route path="/decks" element={<ProtectedRoute><Decks /></ProtectedRoute>} />
                  <Route path="/join/:token" element={<ProtectedRoute><JoinDeck /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </I18nProvider>
            </OrganizationProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
