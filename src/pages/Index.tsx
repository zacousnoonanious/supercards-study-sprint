
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Users, Zap } from 'lucide-react';

const Index = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const flashcards = [
    { front: 'What is React?', back: 'A JavaScript library for building user interfaces', delay: 0 },
    { front: 'CSS Flexbox', back: 'A layout method for arranging items in rows or columns', delay: 0.2 },
    { front: 'HTTP Status 404', back: 'Not Found - The requested resource could not be found', delay: 0.4 },
    { front: 'JavaScript const', back: 'Declares a block-scoped constant variable', delay: 0.6 },
    { front: 'Git commit', back: 'Records changes to the repository', delay: 0.8 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <header className="bg-white shadow-sm border-b relative z-10">
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

      {/* Parallax Flashcards Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {flashcards.map((card, index) => {
          const cardOffset = scrollY * (0.3 + index * 0.1);
          const rotation = (scrollY * 0.1 + index * 20) % 360;
          const isFlipped = (scrollY + index * 100) % 400 > 200;
          
          return (
            <div
              key={index}
              className="absolute transition-transform duration-1000 ease-out"
              style={{
                left: `${10 + (index % 3) * 35}%`,
                top: `${20 + Math.floor(index / 3) * 40}%`,
                transform: `translateY(${cardOffset}px) rotate(${rotation}deg) rotateY(${isFlipped ? 180 : 0}deg)`,
                transformStyle: 'preserve-3d',
                animationDelay: `${card.delay}s`,
              }}
            >
              <div className="relative w-48 h-32 [perspective:1000px]">
                <div
                  className="absolute inset-0 w-full h-full transition-transform duration-700"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front of card */}
                  <div className="absolute inset-0 w-full h-full bg-white border-2 border-indigo-200 rounded-lg shadow-lg p-4 flex items-center justify-center [backface-visibility:hidden]">
                    <p className="text-sm font-medium text-indigo-900 text-center">{card.front}</p>
                  </div>
                  {/* Back of card */}
                  <div 
                    className="absolute inset-0 w-full h-full bg-indigo-100 border-2 border-indigo-300 rounded-lg shadow-lg p-4 flex items-center justify-center [backface-visibility:hidden]"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <p className="text-xs text-indigo-800 text-center">{card.back}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
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
          <Card className="text-center hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm">
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

          <Card className="text-center hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm">
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

          <Card className="text-center hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm">
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

          <Card className="text-center hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm">
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

        <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8">
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
