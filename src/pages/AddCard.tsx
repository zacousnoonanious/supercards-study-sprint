
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { InteractiveCardCreator } from '@/components/InteractiveCardCreator';

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
    navigate(`/set/${setId}`);
  };

  const handleClose = () => {
    navigate(`/set/${setId}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <InteractiveCardCreator
        setId={setId!}
        onCardCreated={handleCardCreated}
        onClose={handleClose}
      />
    </div>
  );
};

export default AddCard;
