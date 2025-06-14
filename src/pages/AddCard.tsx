
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { InteractiveCardCreator } from '@/components/InteractiveCardCreator';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AddCard = () => {
  const { id: setId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleCardCreated = () => {
    navigate(`/set/${setId}`);
  };

  const handleClose = () => {
    navigate(`/set/${setId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Set
          </Button>
          <h2 className="text-2xl font-bold text-foreground">Add New Card</h2>
        </div>
        
        <div className="flex items-center justify-center">
          <InteractiveCardCreator
            setId={setId!}
            onCardCreated={handleCardCreated}
            onClose={handleClose}
          />
        </div>
      </main>
    </div>
  );
};

export default AddCard;
