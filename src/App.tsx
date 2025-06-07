
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from '@/contexts/I18nContext';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SetView from "./pages/SetView";
import StudyMode from "./pages/StudyMode";
import CreateSet from "./pages/CreateSet";
import CardEditorPage from "./pages/CardEditorPage";
import Auth from "./pages/Auth";
import Decks from "./pages/Decks";
import AddCard from "./pages/AddCard";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <I18nProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/decks" element={<Decks />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/sets/:setId" element={<SetView />} />
                <Route path="/sets/:setId/study" element={<StudyMode />} />
                <Route path="/sets/:setId/cards/:cardId" element={<CardEditorPage />} />
                <Route path="/sets/:setId/add" element={<AddCard />} />
                <Route path="/create-set" element={<CreateSet />} />
                <Route path="/set/:setId" element={<SetView />} />
                <Route path="/study/:setId" element={<StudyMode />} />
                <Route path="/edit-cards/:setId" element={<CardEditorPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </ThemeProvider>
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
