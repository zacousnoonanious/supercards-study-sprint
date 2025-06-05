
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Users, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600">SuperCards</h1>
            <div className="space-x-4">
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Master Any Subject with
            <span className="text-indigo-600"> SuperCards</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create, organize, and study flashcards like never before. Track your progress and accelerate your learning with our intelligent study system.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Learning Today
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Create Sets</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize your flashcards into custom sets for different subjects and topics.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Smart Study</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Study mode with instant feedback to track your progress and identify weak areas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your learning with detailed statistics and performance tracking.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your flashcards are private and secure, accessible only by you.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
          <p className="text-gray-600 mb-6">Join SuperCards today and transform the way you study.</p>
          <Link to="/auth">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
