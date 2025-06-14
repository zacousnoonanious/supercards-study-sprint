
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Eye, Edit3 } from 'lucide-react';
import { CollaborativeUser, CollaboratorInfo } from '@/hooks/useCollaborativeEditing';

interface CollaborationIndicatorProps {
  activeUsers: CollaborativeUser[];
  collaborators: CollaboratorInfo[];
  currentCardId?: string;
  isCollaborative: boolean;
}

export const CollaborationIndicator: React.FC<CollaborationIndicatorProps> = ({
  activeUsers,
  collaborators,
  currentCardId,
  isCollaborative,
}) => {
  if (!isCollaborative) return null;

  const usersOnCurrentCard = activeUsers.filter(user => user.card_id === currentCardId);
  const usersOnOtherCards = activeUsers.filter(user => user.card_id !== currentCardId && user.card_id);
  const usersOnDeck = activeUsers.filter(user => !user.card_id);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRole = (userId: string) => {
    const collaborator = collaborators.find(c => c.user_id === userId);
    return collaborator?.role || 'viewer';
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-background/95 backdrop-blur-sm rounded-lg border shadow-sm">
      <Users className="w-4 h-4 text-muted-foreground" />
      
      {/* Users on current card */}
      {usersOnCurrentCard.length > 0 && (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            {usersOnCurrentCard.slice(0, 3).map((user) => (
              <Tooltip key={user.id}>
                <TooltipTrigger>
                  <div className="relative">
                    <Avatar className="w-6 h-6 ring-2 ring-green-500">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      {getUserRole(user.id) === 'editor' ? (
                        <Edit3 className="w-3 h-3 text-green-500 bg-background rounded-full p-0.5" />
                      ) : (
                        <Eye className="w-3 h-3 text-blue-500 bg-background rounded-full p-0.5" />
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.name} - {getUserRole(user.id)}</p>
                  <p className="text-xs text-muted-foreground">Active on this card</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {usersOnCurrentCard.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{usersOnCurrentCard.length - 3}
              </Badge>
            )}
          </TooltipProvider>
        </div>
      )}

      {/* Users on other cards */}
      {usersOnOtherCards.length > 0 && (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            {usersOnOtherCards.slice(0, 2).map((user) => (
              <Tooltip key={user.id}>
                <TooltipTrigger>
                  <div className="relative">
                    <Avatar className="w-6 h-6 ring-2 ring-orange-500 opacity-70">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.name} - {getUserRole(user.id)}</p>
                  <p className="text-xs text-muted-foreground">Active on another card</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {usersOnOtherCards.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{usersOnOtherCards.length - 2}
              </Badge>
            )}
          </TooltipProvider>
        </div>
      )}

      {/* Users browsing deck */}
      {usersOnDeck.length > 0 && (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            {usersOnDeck.slice(0, 2).map((user) => (
              <Tooltip key={user.id}>
                <TooltipTrigger>
                  <Avatar className="w-6 h-6 ring-2 ring-gray-400 opacity-50">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.name} - {getUserRole(user.id)}</p>
                  <p className="text-xs text-muted-foreground">Browsing deck</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )}

      {activeUsers.length === 0 && (
        <span className="text-xs text-muted-foreground">No other users online</span>
      )}
    </div>
  );
};
