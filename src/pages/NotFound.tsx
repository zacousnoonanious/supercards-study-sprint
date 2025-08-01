
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardContent className="py-16">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NotFound;
