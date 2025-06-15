
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import { Building, User, Users, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lang } from '@/i18n/translations/en/lang';

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
        <CardTitle className="text-2xl">Welcome to SuperCards!</CardTitle>
        <CardDescription>Let's get you set up in just a moment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">First, please confirm your language:</label>
          <OnboardingLanguageSelector />
        </div>
        <Button onClick={onNext} className="w-full">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

const OrgStep = ({ onComplete }: { onComplete: () => void }) => {
  const { t } = useI18n();

  const handleSelection = (type: 'create' | 'join' | 'individual') => {
    // For now, all paths lead to completion.
    // This can be expanded later to include actual org creation/joining logic.
    if (type === 'individual') {
       onComplete();
    } else {
        // Placeholder for future implementation
        alert("This feature is coming soon! For now, you can continue as an individual.");
        onComplete();
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>How will you be using SuperCards?</CardTitle>
        <CardDescription>You can always change this later from your settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full h-auto p-4 justify-start text-left" onClick={() => handleSelection('create')}>
          <Building className="mr-4 h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">Create an organization</p>
            <p className="text-sm text-muted-foreground">Collaborate with your team on shared decks.</p>
          </div>
        </Button>
        <Button variant="outline" className="w-full h-auto p-4 justify-start text-left" onClick={() => handleSelection('join')}>
          <Users className="mr-4 h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">Join an organization</p>
            <p className="text-sm text-muted-foreground">Join via an invite code or email.</p>
          </div>
        </Button>
        <Button variant="outline" className="w-full h-auto p-4 justify-start text-left" onClick={() => handleSelection('individual')}>
          <User className="mr-4 h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">Use as an individual</p>
            <p className="text-sm text-muted-foreground">For personal study and creating your own decks.</p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};


export const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(1);
    
    return (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md">
                {step === 1 && <WelcomeStep onNext={() => setStep(2)} />}
                {step === 2 && <OrgStep onComplete={onComplete} />}
            </div>
        </div>
    );
};
