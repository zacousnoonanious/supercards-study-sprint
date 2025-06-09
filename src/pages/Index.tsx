
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HeroSection } from '@/components/home/HeroSection';
import { CoreFeatures } from '@/components/home/CoreFeatures';
import { CardEditorShowcase } from '@/components/home/CardEditorShowcase';
import { PricingPlans } from '@/components/home/PricingPlans';
import { FinalCTA } from '@/components/home/FinalCTA';
import { Navigation } from '@/components/Navigation';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Don't render homepage if user is logged in
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 py-20 space-y-32">
        <CoreFeatures />
        <CardEditorShowcase />
        <PricingPlans />
        <FinalCTA />
      </div>
    </div>
  );
};

export default Index;
