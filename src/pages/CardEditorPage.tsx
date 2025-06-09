
import React from 'react';
import { CardEditor } from '@/components/CardEditor';
import { Navigation } from '@/components/Navigation';

const CardEditorPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <CardEditor />
    </div>
  );
};

export default CardEditorPage;
