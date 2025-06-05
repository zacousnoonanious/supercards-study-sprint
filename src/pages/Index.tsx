
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Users, Zap, CheckCircle, Star, Globe, BarChart3, Mic, Download, Shield, Sparkles } from 'lucide-react';

const Index = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const flashcardPool = [
    { front: 'What is React?', back: 'A JavaScript library for building user interfaces' },
    { front: 'CSS Flexbox', back: 'A layout method for arranging items in rows or columns' },
    { front: 'HTTP Status 404', back: 'Not Found - The requested resource could not be found' },
    { front: 'JavaScript const', back: 'Declares a block-scoped constant variable' },
    { front: 'Git commit', back: 'Records changes to the repository' },
    { front: 'Machine Learning', back: 'AI technique that enables computers to learn from data' },
    { front: 'Photosynthesis', back: 'Process plants use to convert sunlight into energy' },
    { front: 'DNA', back: 'Deoxyribonucleic acid - carries genetic information' },
    { front: 'Newton\'s First Law', back: 'An object at rest stays at rest unless acted upon by force' },
    { front: 'Mitochondria', back: 'The powerhouse of the cell' },
    { front: 'Supply & Demand', back: 'Economic principle of price determination' },
    { front: 'World War II', back: 'Global conflict from 1939-1945' },
    { front: 'Pythagorean Theorem', back: 'a² + b² = c² for right triangles' },
    { front: 'Spanish: Hola', back: 'English: Hello' },
    { front: 'Quantum Physics', back: 'Study of matter and energy at atomic scale' },
    { front: 'Marketing Mix', back: 'Product, Price, Place, Promotion (4 Ps)' },
    { front: 'Cellular Respiration', back: 'Process cells use to break down glucose for energy' },
    { front: 'French Revolution', back: 'Political revolution in France (1789-1799)' },
    { front: 'Binary Code', back: 'Computer language using only 0s and 1s' },
    { front: 'Ecosystem', back: 'Community of living organisms and their environment' }
  ];

  const selectedCards = flashcardPool.slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* CSS Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          
          .hover-scale {
            transition: transform 0.2s ease;
          }
          
          .hover-scale:hover {
            transform: scale(1.05);
          }
          
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `
      }} />

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
        {selectedCards.map((card, index) => {
          const cardOffset = scrollY * (0.2 + index * 0.08);
          const rotation = (scrollY * 0.05 + index * 15) % 360;
          const isFlipped = (scrollY + index * 120) % 500 > 250;
          
          return (
            <div
              key={index}
              className="absolute transition-all duration-1000 ease-out opacity-20 hover:opacity-30"
              style={{
                left: `${5 + (index % 4) * 25}%`,
                top: `${15 + Math.floor(index / 4) * 35}%`,
                transform: `translateY(${cardOffset}px) rotate(${rotation}deg) rotateY(${isFlipped ? 180 : 0}deg)`,
                transformStyle: 'preserve-3d',
                animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
              }}
            >
              <div className="relative w-56 h-36 [perspective:1000px]">
                <div
                  className="absolute inset-0 w-full h-full transition-transform duration-700"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  <div className="absolute inset-0 w-full h-full bg-white border-2 border-indigo-200 rounded-lg shadow-lg p-4 flex items-center justify-center [backface-visibility:hidden]">
                    <p className="text-sm font-medium text-indigo-900 text-center">{card.front}</p>
                  </div>
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
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Master Any Subject with
            <span className="text-indigo-600"> SuperCards</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create, organize, and study flashcards like never before. Track your progress and accelerate your learning with our intelligent study system powered by AI.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-4 hover-scale">
              Start Learning Today
            </Button>
          </Link>
        </div>

        {/* Core Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            { icon: BookOpen, title: "Create Sets", desc: "Organize your flashcards into custom sets for different subjects and topics." },
            { icon: Brain, title: "Smart Study", desc: "Study mode with instant feedback to track your progress and identify weak areas." },
            { icon: Zap, title: "Track Progress", desc: "Monitor your learning with detailed statistics and performance tracking." },
            { icon: Users, title: "Share & Collaborate", desc: "Share decks with others and collaborate on learning materials." }
          ].map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm hover-scale" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <feature.icon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Features Section */}
        <div className="mb-20 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8 animate-fade-in">
          <h3 className="text-3xl font-bold text-center mb-12">Powerful Features for Every Learner</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: "AI-Powered Quiz Generation", desc: "Instantly turn any set of cards into multiple-choice or true/false quizzes with immediate feedback." },
              { icon: Brain, title: "AI Deck Generator", desc: "Enter any topic and let our AI create a complete deck of 5-10 cards ready for review." },
              { icon: Globe, title: "Visual Card Editor", desc: "Drag, drop, resize, and rotate text blocks, images, and widgets directly on each card." },
              { icon: BarChart3, title: "Advanced Analytics", desc: "Track learning streaks, accuracy rates, completion times, and identify weak topics." },
              { icon: Mic, title: "Speech Tools", desc: "Text-to-speech and pronunciation analysis with accuracy scoring and feedback." },
              { icon: Download, title: "Offline Support", desc: "Download decks for offline review and sync progress when back online." }
            ].map((feature, index) => (
              <div key={index} className="text-center p-4">
                <feature.icon className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card Types */}
        <div className="mb-20 animate-fade-in">
          <h3 className="text-3xl font-bold text-center mb-12">Multiple Card Types for Every Learning Style</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Info Panels", desc: "Full-screen, theory-style cards for important concepts" },
              { title: "Quiz Cards", desc: "Must answer correctly before advancing; tracks points automatically" },
              { title: "Poll Cards", desc: "Collect opinions or quick feedback from learners" },
              { title: "Media Cards", desc: "Play audio or video clips before revealing content" }
            ].map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{type.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-20 animate-fade-in">
          <h3 className="text-3xl font-bold text-center mb-4">Choose Your Plan</h3>
          <p className="text-center text-gray-600 mb-12">Start free, upgrade when you need more power</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="relative bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-3xl font-bold">$0</div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Create up to 3 decks and 50 cards",
                  "Basic AI quiz generation (5 questions/day)",
                  "Community Marketplace access",
                  "Basic progress tracking"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                <Link to="/auth" className="block mt-6">
                  <Button className="w-full" variant="outline">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative bg-gradient-to-b from-indigo-50 to-white border-2 border-indigo-200 hover:shadow-xl transition-all duration-300 scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-3xl font-bold">$12<span className="text-lg font-normal">/month</span></div>
                <CardDescription>or $120/year (save 17%)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Unlimited decks and cards",
                  "Full AI quiz generator (unlimited)",
                  "AI deck generator (20 cards/topic)",
                  "Advanced analytics & progress summaries",
                  "Priority email support",
                  "Upload media up to 10 MB per card"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                <Link to="/auth" className="block mt-6">
                  <Button className="w-full">Start Pro Trial</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-2xl font-bold">Custom</div>
                <CardDescription>For teams and organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "All Pro features included",
                  "Organization management dashboard",
                  "SSO & bulk user provisioning",
                  "Custom branding options",
                  "Dedicated customer success",
                  "Advanced security & compliance"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                <Link to="/auth" className="block mt-6">
                  <Button className="w-full" variant="outline">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials or Social Proof */}
        <div className="mb-16 text-center bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8 animate-fade-in">
          <h3 className="text-2xl font-bold mb-8">Trusted by learners worldwide</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { rating: 5, text: "SuperCards transformed how I study. The AI features are incredible!", author: "Sarah, Medical Student" },
              { rating: 5, text: "Perfect for our team training. The collaboration features are top-notch.", author: "Mike, Team Lead" },
              { rating: 5, text: "Love the offline support. I can study anywhere, anytime.", author: "Alex, Language Learner" }
            ].map((testimonial, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-2 italic">"{testimonial.text}"</p>
                <p className="font-medium">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-8 animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">Ready to supercharge your learning?</h3>
          <p className="text-xl mb-6 opacity-90">Join thousands of students, professionals, and teams using SuperCards.</p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3 hover-scale">
              Start Your Free Account
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
