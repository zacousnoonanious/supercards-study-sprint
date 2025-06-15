
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Check } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface SignUpSuccessProps {
  email: string;
  onContinue: () => void;
}

export const SignUpSuccess: React.FC<SignUpSuccessProps> = ({ email, onContinue }) => {
  const { t } = useI18n();

  return (
    <div className="h-screen w-screen fixed inset-0 overflow-hidden bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <Navigation />
      
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex items-center justify-center p-4 pt-16">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl animate-scale-in text-center">
          <CardHeader>
            <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
              <Check className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600">Thanks for signing up!</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              A confirmation email has been sent to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Welcome to the <span className="font-bold text-purple-600">SuperCards</span> community! 🎉
              </p>
              <p className="text-sm text-gray-600">
                Please check your email and click the confirmation link to activate your account.
              </p>
              <Button 
                onClick={onContinue}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {t('common.continue')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
