
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <OrganizationProvider>
            <I18nProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/join/:token" element={<JoinDeck />} />
                  <Route path="/marketplace" element={<Marketplace />} />

                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/create-set" element={<ProtectedRoute><CreateSet /></ProtectedRoute>} />
                  <Route path="/decks" element={<ProtectedRoute><Decks /></ProtectedRoute>} />
                  <Route path="/set/:id" element={<ProtectedRoute><SetView /></ProtectedRoute>} />
                  <Route path="/set/:id/study" element={<ProtectedRoute><StudyMode /></ProtectedRoute>} />
                  <Route path="/set/:id/edit" element={<ProtectedRoute><CardEditorPage /></ProtectedRoute>} />
                  <Route path="/set/:id/edit/:cardId" element={<ProtectedRoute><CardEditorPage /></ProtectedRoute>} />
                  
                  {/* Primary editor routes */}
                  <Route path="/edit/:setId" element={<ProtectedRoute><CardEditorPage /></ProtectedRoute>} />
                  <Route path="/edit/:setId/:cardId" element={<ProtectedRoute><CardEditorPage /></ProtectedRoute>} />
                  
                  <Route path="/study/:id" element={<ProtectedRoute><StudyMode /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                  <Route path="/stats" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </I18nProvider>
          </OrganizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
