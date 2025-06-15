
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import CreateSet from "./pages/CreateSet";
import Decks from "./pages/Decks";
import SetView from "./pages/SetView";
import CardEditorPage from "./pages/CardEditorPage";
import StudyMode from "./pages/StudyMode";
import Profile from "./pages/Profile";
import JoinDeck from "./pages/JoinDeck";
import Admin from "./pages/Admin";
import Marketplace from "./pages/Marketplace";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <OrganizationProvider>
              <I18nProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/create-set" element={<CreateSet />} />
                    <Route path="/decks" element={<Decks />} />
                    <Route path="/set/:id" element={<SetView />} />
                    <Route path="/edit/:setId" element={<CardEditorPage />} />
                    <Route path="/edit/:setId/:cardId" element={<CardEditorPage />} />
                    <Route path="/study/:id" element={<StudyMode />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/join/:token" element={<JoinDeck />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </I18nProvider>
            </OrganizationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
