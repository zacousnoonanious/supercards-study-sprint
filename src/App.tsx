
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/contexts/ThemeContext"
import { I18nProvider } from '@/contexts/I18nContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Auth from '@/pages/Auth';
import Decks from '@/pages/Decks';
import CreateSet from '@/pages/CreateSet';
import SetView from '@/pages/SetView';
import Dashboard from '@/pages/Dashboard';
import JoinDeck from '@/pages/JoinDeck';
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrganizationProvider } from '@/contexts/OrganizationContext';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <OrganizationProvider>
              <QueryClientProvider client={queryClient}>
                <div className="App">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/decks" element={<Decks />} />
                    <Route path="/create-set" element={<CreateSet />} />
                    <Route path="/set/:setId" element={<SetView />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/invite/:inviteToken" element={<JoinDeck />} />
                  </Routes>
                </div>
                <Toaster />
              </QueryClientProvider>
            </OrganizationProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
