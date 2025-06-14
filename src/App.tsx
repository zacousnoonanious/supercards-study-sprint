import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Decks from './pages/Decks';
import SetView from './pages/SetView';
import EditCards from './pages/EditCards';
import CreateSet from './pages/CreateSet';
import Study from './pages/Study';
import Auth from './pages/Auth';
import { Toaster } from '@/components/ui/toaster';

import JoinDeck from './pages/JoinDeck';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/decks" element={<Decks />} />
          <Route path="/set/:id" element={<SetView />} />
          <Route path="/edit-cards/:id" element={<EditCards />} />
          <Route path="/create-set" element={<CreateSet />} />
          <Route path="/study/:id" element={<Study />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/invite/:inviteToken" element={<JoinDeck />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
