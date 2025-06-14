import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from '@/contexts/I18nContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Decks from '@/pages/Decks';
import CreateSet from '@/pages/CreateSet';
import EditCards from '@/pages/EditCards';
import SetView from '@/pages/SetView';
import Study from '@/pages/Study';
import Dashboard from '@/pages/Dashboard';
import Account from '@/pages/Account';
import JoinDeck from '@/pages/JoinDeck';
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrganizationProvider } from '@/contexts/OrganizationContext';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <I18nProvider>
          <AuthProvider>
            <OrganizationProvider>
              <QueryClientProvider client={queryClient}>
                <div className="App">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/decks" element={<Decks />} />
                    <Route path="/create-set" element={<CreateSet />} />
                    <Route path="/edit-cards/:setId" element={<EditCards />} />
                    <Route path="/set/:setId" element={<SetView />} />
                    <Route path="/study/:setId" element={<Study />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/account" element={<Account />} />
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
