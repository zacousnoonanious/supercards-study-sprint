
import React from 'react';
import { useParams } from 'react-router-dom';
import { CardEditor } from '@/components/CardEditor';

const CardEditorPage = () => {
  const { id: setId } = useParams<{ id: string }>();
  
  return (
    <div className="min-h-screen bg-background">
      <CardEditor setId={setId} />
    </div>
  );
};

export default CardEditorPage;
