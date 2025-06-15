
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, BarChart3, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImportFlashcardsDialog } from '@/components/ImportFlashcardsDialog';

export const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild className="w-full justify-start" variant="outline">
          <Link to="/create-set">
            <Plus className="w-4 h-4 mr-2" />
            Create New Deck
          </Link>
        </Button>
        
        <ImportFlashcardsDialog
          trigger={
            <Button variant="outline" className="w-full justify-start">
              <Upload className="w-4 h-4 mr-2" />
              Import Flashcards
            </Button>
          }
        />
        
        <Button asChild className="w-full justify-start" variant="outline">
          <Link to="/decks">
            <BarChart3 className="w-4 h-4 mr-2" />
            View All Decks
          </Link>
        </Button>
        
        <Button asChild className="w-full justify-start" variant="outline">
          <Link to="/profile">
            <Settings className="w-4 h-4 mr-2" />
            Account Settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
