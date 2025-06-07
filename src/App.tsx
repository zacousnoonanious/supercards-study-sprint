
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SetView from "./pages/SetView";
import StudyMode from "./pages/StudyMode";
import CreateSet from "./pages/CreateSet";
import EditSet from "./pages/EditSet";
import CardEditorPage from "./pages/CardEditorPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sets/:setId" element={<SetView />} />
              <Route path="/sets/:setId/study" element={<StudyMode />} />
              <Route path="/sets/:setId/cards/:cardId" element={<CardEditorPage />} />
              <Route path="/create-set" element={<CreateSet />} />
              <Route path="/edit-set/:setId" element={<EditSet />} />
            </Routes>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
