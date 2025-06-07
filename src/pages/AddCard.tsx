
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { InteractiveCardCreator } from '@/components/InteractiveCardCreator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';

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

  const handleBackToSet = () => {
    navigate(`/sets/${setId}`);
  };

  const handleViewCards = () => {
    navigate(`/sets/${setId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with navigation */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleBackToSet}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Set
          </Button>
          <Button
            variant="outline"
            onClick={handleViewCards}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Cards
          </Button>
        </div>
      </div>

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
