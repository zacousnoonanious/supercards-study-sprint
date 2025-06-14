
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Decks from "./pages/Decks";
import CreateSet from "./pages/CreateSet";
import AddCard from "./pages/AddCard";
import SetView from "./pages/SetView";
import StudyMode from "./pages/StudyMode";
import CardEditorPage from "./pages/CardEditorPage";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";
import JoinDeck from "./pages/JoinDeck";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <OrganizationProvider>
            <I18nProvider>
              <ThemeProvider>
                <TooltipProvider>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/decks" element={<Decks />} />
                      <Route path="/create-set" element={<CreateSet />} />
                      <Route path="/add-card/:setId" element={<AddCard />} />
                      <Route path="/sets/:id" element={<SetView />} />
                      <Route path="/set/:id" element={<SetView />} />
                      <Route path="/study/:id" element={<StudyMode />} />
                      <Route path="/sets/:id/study" element={<StudyMode />} />
                      <Route path="/sets/:id/cards" element={<CardEditorPage />} />
                      <Route path="/sets/:id/cards/:cardId" element={<CardEditorPage />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/marketplace" element={<Marketplace />} />
                      <Route path="/join/:token" element={<JoinDeck />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </ThemeProvider>
            </I18nProvider>
          </OrganizationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
