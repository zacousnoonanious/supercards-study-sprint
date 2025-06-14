
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Decks from './pages/Decks';
import SetView from './pages/SetView';
import CardEditorPage from './pages/CardEditorPage';
import CreateSet from './pages/CreateSet';
import StudyMode from './pages/StudyMode';
import Auth from './pages/Auth';
import { Toaster } from '@/components/ui/toaster';

import JoinDeck from './pages/JoinDeck';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/decks" element={<Decks />} />
          <Route path="/set/:id" element={<SetView />} />
          <Route path="/edit-cards/:id" element={<CardEditorPage />} />
          <Route path="/create-set" element={<CreateSet />} />
          <Route path="/study/:id" element={<StudyMode />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/invite/:inviteToken" element={<JoinDeck />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
