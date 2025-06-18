
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Edit, 
  Play, 
  Trash2, 
  Share2, 
  Download,
  Users,
  Calendar,
  BookOpen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface DeckCardProps {
  set: {
    id: string;
    title: string;
    description?: string;
    created_at: string;
    updated_at: string;
    is_collaborative?: boolean;
  };
  onDelete: (deckId: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ set, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('DeckCard: Navigating to editor for set:', set.id);
    navigate(`/edit/${set.id}`);
  };

  const handleStudy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/study/${set.id}`);
  };

  const handleView = () => {
    console.log('DeckCard: Navigating to set view for:', set.id);
    navigate(`/set/${set.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this deck?')) {
      onDelete(set.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement share functionality
    console.log('Share deck:', set.id);
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement export functionality
    console.log('Export deck:', set.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={handleView}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {set.title}
          </CardTitle>
          {set.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {set.description}
            </p>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleStudy}>
              <Play className="mr-2 h-4 w-4" />
              Study
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>Cards</span>
            </div>
            {set.is_collaborative && (
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Collaborative
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(set.updated_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button size="sm" onClick={handleStudy} className="flex-1">
            <Play className="h-3 w-3 mr-1" />
            Study
          </Button>
          <Button size="sm" variant="outline" onClick={handleEdit}>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
