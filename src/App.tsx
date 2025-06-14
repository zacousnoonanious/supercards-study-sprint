
import { Toaster } from "@/components/ui/sonner";
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
import Profile from "./pages/Profile";
import Decks from "./pages/Decks";
import CreateSet from "./pages/CreateSet";
import SetView from "./pages/SetView";
import CardEditorPage from "./pages/CardEditorPage";
import StudyMode from "./pages/StudyMode";
import AddCard from "./pages/AddCard";
import JoinDeck from "./pages/JoinDeck";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <I18nProvider>
            <OrganizationProvider>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/decks" element={<Decks />} />
                    <Route path="/create-set" element={<CreateSet />} />
                    <Route path="/set/:id" element={<SetView />} />
                    <Route path="/set/:id/card/:cardId/edit" element={<CardEditorPage />} />
                    <Route path="/set/:id/study" element={<StudyMode />} />
                    <Route path="/set/:id/add-card" element={<AddCard />} />
                    <Route path="/join/:token" element={<JoinDeck />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </OrganizationProvider>
          </I18nProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
