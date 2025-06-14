
import React from 'react';
import { useParams } from 'react-router-dom';
import { CardEditor } from '@/components/CardEditor';

const CardEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  
  console.log('CardEditorPage: Received setId from params:', id);
  
  if (!id) {
    console.log('CardEditorPage: No setId found in params');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Set not found</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <CardEditor setId={id} />
    </div>
  );
};

export default CardEditorPage;
