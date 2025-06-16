
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/contexts/I18nContext';
import { Building, User, Users, ArrowRight, BarChart3, BookOpen, Star, Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lang } from '@/i18n/translations/en/lang';
import { CreateOrganizationDialog } from '@/components/CreateOrganizationDialog';
import { JoinDeckDialog } from '@/components/JoinDeckDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const OnboardingLanguageSelector = () => {
  const { language, setLanguage } = useI18n();
  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(lang).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
  const { t } = useI18n();
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">{t('welcomeToSuperCards')}</CardTitle>
        <CardDescription>{t('letsGetYouSetUpInJustAMoment')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">{t('firstPleaseConfirmYourLanguage')}</label>
          <OnboardingLanguageSelector />
        </div>
        <Button onClick={onNext} className="w-full">
          {t('common.next')} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

const MetricsOptInStep = ({ onNext }: { onNext: (optIn: boolean) => void }) => {
  const { t } = useI18n();
  const [optIn, setOptIn] = useState(true);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Help Us Improve SuperCards
        </CardTitle>
        <CardDescription>
          Would you like to share your study metrics to help us improve the platform and enable social features?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            {optIn ? (
              <Eye className="h-5 w-5 text-blue-500 mt-0.5" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div>
              <div className="font-medium">Share study metrics and appear on leaderboards</div>
              <div className="text-sm text-muted-foreground mt-1">
                This enables features like progress tracking, leaderboards, and personalized insights. 
                You can change this setting anytime in your profile.
              </div>
            </div>
          </div>
          <Switch
            checked={optIn}
            onCheckedChange={setOptIn}
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <div className="text-sm">
            <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              What data is shared?
            </div>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs">
              <li>• Study streaks and session times</li>
              <li>• Number of cards reviewed (not content)</li>
              <li>• Performance statistics and progress</li>
              <li>• Display name and avatar (if you choose to set them)</li>
            </ul>
            <div className="mt-2 text-blue-700 dark:text-blue-300 text-xs">
              Your flashcard content and detailed study history remain completely private.
            </div>
          </div>
        </div>

        <Button onClick={() => onNext(optIn)} className="w-full">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

const OrgStep = ({ onNext }: { onNext: () => void }) => {
  const { t } = useI18n();
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showJoinOrg, setShowJoinOrg] = useState(false);

  const handleSelection = (type: 'create' | 'join' | 'individual') => {
    if (type === 'individual') {
      onNext();
    } else if (type === 'create') {
      setShowCreateOrg(true);
    } else if (type === 'join') {
      setShowJoinOrg(true);
    }
  };

  return (
    <>
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>{t('howWillYouBeUsingSuperCards')}</CardTitle>
          <CardDescription>{t('youCanAlwaysChangeThisLaterFromYourSettings')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full h-auto p-4 justify-start text-left" onClick={() => handleSelection('create')}>
            <Building className="mr-4 h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">{t('createAnOrganization')}</p>
              <p className="text-sm text-muted-foreground">{t('collaborateWithYourTeamOnSharedDecks')}</p>
            </div>
          </Button>
          <Button variant="outline" className="w-full h-auto p-4 justify-start text-left" onClick={() => handleSelection('join')}>
            <Users className="mr-4 h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">{t('joinAnOrganization')}</p>
              <p className="text-sm text-muted-foreground">{t('joinViaAnInviteCodeOrEmail')}</p>
            </div>
          </Button>
          <Button variant="outline" className="w-full h-auto p-4 justify-start text-left" onClick={() => handleSelection('individual')}>
            <User className="mr-4 h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">{t('useAsAnIndividual')}</p>
              <p className="text-sm text-muted-foreground">{t('forPersonalStudyAndCreatingYourOwnDecks')}</p>
            </div>
          </Button>
        </CardContent>
      </Card>
      <CreateOrganizationDialog
        open={showCreateOrg}
        onOpenChange={setShowCreateOrg}
        onSuccess={onNext}
      />
      <JoinDeckDialog
        open={showJoinOrg}
        onOpenChange={setShowJoinOrg}
        onJoinOrgSuccess={onNext}
        initialView="organization"
      />
    </>
  );
};

const InfoPanelsStep = ({ onComplete }: { onComplete: () => void }) => {
  const { t } = useI18n();
  const [currentPanel, setCurrentPanel] = useState(0);

  const panels = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-500" />,
      title: "Welcome to Your Dashboard",
      description: "Your dashboard is your command center for all things SuperCards.",
      features: [
        "View your recent decks and study progress",
        "Quick actions to create new decks or import content",
        "Track your study streaks and achievements",
        "Access all your flashcard sets in one place"
      ]
    },
    {
      icon: <Star className="h-8 w-8 text-green-500" />,
      title: "Creating & Studying Flashcards",
      description: "SuperCards makes it easy to create engaging, interactive flashcards.",
      features: [
        "Rich text editor with images, audio, and interactive elements",
        "Multiple card types: standard, fill-in-the-blank, and quiz cards",
        "Spaced repetition system (SRS) for optimal learning",
        "Study modes with customizable settings and timers"
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
      title: "Track Your Progress",
      description: "Monitor your learning journey with detailed analytics and insights.",
      features: [
        "Personal study statistics and performance trends",
        "Leaderboards to compare progress with other users",
        "Insights into your strengths and areas for improvement",
        "Study streak tracking and achievement badges"
      ]
    }
  ];

  const currentPanelData = panels[currentPanel];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {currentPanelData.icon}
          {currentPanelData.title}
        </CardTitle>
        <CardDescription>{currentPanelData.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {currentPanelData.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {panels.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentPanel ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentPanel > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentPanel(currentPanel - 1)}
                size="sm"
              >
                Previous
              </Button>
            )}
            
            {currentPanel < panels.length - 1 ? (
              <Button
                onClick={() => setCurrentPanel(currentPanel + 1)}
                size="sm"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={onComplete} size="sm">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleMetricsOptIn = async (optIn: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ show_in_leaderboard: optIn })
        .eq('id', user.id);
      
      if (error) throw error;
      setStep(3);
    } catch (error) {
      console.error('Error updating metrics preference:', error);
      toast({
        title: "Error",
        description: "Failed to save your preference, but you can change it later in settings.",
        variant: "destructive"
      });
      setStep(3); // Continue anyway
    }
  };
  
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        {step === 1 && <WelcomeStep onNext={() => setStep(2)} />}
        {step === 2 && <MetricsOptInStep onNext={handleMetricsOptIn} />}
        {step === 3 && <OrgStep onNext={() => setStep(4)} />}
        {step === 4 && <InfoPanelsStep onComplete={onComplete} />}
      </div>
    </div>
  );
};
