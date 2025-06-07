
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HeroSection } from '@/components/home/HeroSection';
import { CoreFeatures } from '@/components/home/CoreFeatures';
import { CardTypes } from '@/components/home/CardTypes';
import { AdvancedFeatures } from '@/components/home/AdvancedFeatures';
import { PricingPlans } from '@/components/home/PricingPlans';
import { Testimonials } from '@/components/home/Testimonials';
import { FinalCTA } from '@/components/home/FinalCTA';
import { GlobalStyles } from '@/components/home/GlobalStyles';

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
    <div className="min-h-screen bg-background">
      <GlobalStyles />
      <HeroSection />
      <CoreFeatures />
      <CardTypes />
      <AdvancedFeatures />
      <PricingPlans />
      <Testimonials />
      <FinalCTA />
    </div>
  );
};

export default Index;
