import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import CreateSet from "./pages/CreateSet";
import SetView from "./pages/SetView";
import StudyMode from "./pages/StudyMode";
import Decks from "./pages/Decks";
import Profile from "./pages/Profile";
import CardEditorPage from "./pages/CardEditorPage";
import JoinDeck from "./pages/JoinDeck";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <I18nProvider>
              <AuthProvider>
                <OrganizationProvider>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/join/:token" element={<JoinDeck />} />
                    
                    {/* Protected routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/create-set" element={
                      <ProtectedRoute>
                        <CreateSet />
                      </ProtectedRoute>
                    } />
                    <Route path="/set/:id" element={
                      <ProtectedRoute>
                        <SetView />
                      </ProtectedRoute>
                    } />
                    {/* Study mode route - keeping the original pattern */}
                    <Route path="/study/:id" element={
                      <ProtectedRoute>
                        <StudyMode />
                      </ProtectedRoute>
                    } />
                    <Route path="/decks" element={
                      <ProtectedRoute>
                        <Decks />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    {/* Card editor routes - supporting both patterns for compatibility */}
                    <Route path="/sets/:setId/cards/:cardId?" element={
                      <ProtectedRoute>
                        <CardEditorPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/editor/:setId/:cardId?" element={
                      <ProtectedRoute>
                        <CardEditorPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/marketplace" element={
                      <ProtectedRoute>
                        <Marketplace />
                      </ProtectedRoute>
                    } />
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </OrganizationProvider>
              </AuthProvider>
            </I18nProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
