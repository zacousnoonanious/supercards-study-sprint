import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateSet from "./pages/CreateSet";
import SetView from "./pages/SetView";
import StudyMode from "./pages/StudyMode";
import AddCard from "./pages/AddCard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import CardEditorPage from "./pages/CardEditorPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <I18nProvider>
            <ThemeProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-set" element={<CreateSet />} />
                <Route path="/set/:setId" element={<SetView />} />
                <Route path="/study/:setId" element={<StudyMode />} />
                <Route path="/add-card/:setId" element={<AddCard />} />
                <Route path="/edit-set/:setId" element={<Navigate to="/create-set" replace />} />
                <Route path="/edit-card/:cardId" element={<Navigate to="/add-card/:setId" replace />} />
                <Route path="/edit-cards/:setId" element={<CardEditorPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ThemeProvider>
          </I18nProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
