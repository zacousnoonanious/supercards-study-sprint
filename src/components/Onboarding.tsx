
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import { Building, User, Users, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lang } from '@/i18n/translations/en/lang';
import { CreateOrganizationDialog } from '@/components/CreateOrganizationDialog';
import { JoinDeckDialog } from '@/components/JoinDeckDialog';

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

const OrgStep = ({ onComplete }: { onComplete: () => void }) => {
  const { t } = useI18n();
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showJoinOrg, setShowJoinOrg] = useState(false);

  const handleSelection = (type: 'create' | 'join' | 'individual') => {
    if (type === 'individual') {
      onComplete();
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
        onSuccess={onComplete}
      />
      <JoinDeckDialog
        open={showJoinOrg}
        onOpenChange={setShowJoinOrg}
        onJoinOrgSuccess={onComplete}
        initialView="organization"
      />
    </>
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
