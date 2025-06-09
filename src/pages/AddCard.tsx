
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { InteractiveCardCreator } from '@/components/InteractiveCardCreator';
import { Navigation } from '@/components/Navigation';

const AddCard = () => {
  const { setId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleCardCreated = () => {
    navigate(`/sets/${setId}`);
  };

  const handleClose = () => {
    navigate(`/sets/${setId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Card Creator */}
      <div className="flex items-center justify-center p-4">
        <InteractiveCardCreator
          setId={setId!}
          onCardCreated={handleCardCreated}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default AddCard;
