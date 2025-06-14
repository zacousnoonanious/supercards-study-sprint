
export interface CollaborativeUser {
  id: string;
  name: string;
  avatar: string | null;
  cursor_position?: any;
  card_id?: string | null;
  last_seen: string;
}

export interface CollaboratorInfo {
  id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  user_name?: string;
  user_avatar?: string;
}

export interface UseCollaborativeEditingProps {
  setId: string;
  cardId?: string;
}

export interface PresenceState {
  [key: string]: Array<{
    user_id: string;
    user_name: string;
    user_avatar?: string;
    card_id?: string;
    cursor_position?: any;
    last_seen: string;
  }>;
}
