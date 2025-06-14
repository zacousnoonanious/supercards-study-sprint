
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Decks from './pages/Decks';
import SetView from './pages/SetView';
import CardEditorPage from './pages/CardEditorPage';
import CreateSet from './pages/CreateSet';
import StudyMode from './pages/StudyMode';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AddCard from './pages/AddCard';
import { Toaster } from '@/components/ui/toaster';
import JoinDeck from './pages/JoinDeck';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/decks" element={<Decks />} />
        <Route path="/set/:id" element={<SetView />} />
        <Route path="/sets/:id" element={<SetView />} />
        <Route path="/sets/:id/cards/:cardId" element={<CardEditorPage />} />
        <Route path="/edit-cards/:id" element={<CardEditorPage />} />
        <Route path="/create-set" element={<CreateSet />} />
        <Route path="/study/:id" element={<StudyMode />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-card/:setId" element={<AddCard />} />
        <Route path="/invite/:inviteToken" element={<JoinDeck />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
