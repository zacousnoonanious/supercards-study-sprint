
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { useI18n } from '@/contexts/I18nContext';
import { useCardTilt } from '@/hooks/useCardTilt';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';
import { SignUpSuccess } from '@/components/auth/SignUpSuccess';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  useCardTilt(cardRef, containerRef);

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast({
        title: t('auth.emailVerifiedTitle'),
        description: t('auth.emailVerifiedDescription'),
      });
      const emailFromQuery = searchParams.get('email');
      if (emailFromQuery) {
        setEmail(emailFromQuery);
      }
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('verified');
      newSearchParams.delete('email');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, toast, t]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const getPasswordStrength = useCallback((password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, []);

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !passwordsMatch) {
      toast({
        title: t('common.error'),
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && passwordStrength < 3) {
      toast({
        title: t('common.error'),
        description: "Please choose a stronger password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        toast({
          title: t('common.error'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        if (!isLogin) {
          setShowCelebration(true);
        } else {
          toast({
            title: t('auth.welcomeBack'),
            description: t('auth.signInSuccess'),
          });
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('auth.unexpectedError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showCelebration) {
    return <SignUpSuccess email={email} onContinue={() => setShowCelebration(false)} />;
  }

  return (
    <div className="h-screen w-screen fixed inset-0 overflow-hidden">
      <Navigation />
      <AuthLayout>
        <div ref={containerRef} className="w-full max-w-sm md:max-w-md">
            <Card ref={cardRef} className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl transition-transform duration-300 ease-out will-change-transform">
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl md:text-3xl font-bold text-white">{t('auth.title')}</CardTitle>
                <CardDescription className="text-white/80 text-sm">
                {isLogin ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <AuthForm
                    isLogin={isLogin}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    handleSubmit={handleSubmit}
                    loading={loading}
                    passwordStrength={passwordStrength}
                    passwordsMatch={passwordsMatch}
                />
                <div className="text-center pt-2">
                <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-white/90 hover:text-white text-sm transition-colors underline"
                >
                    {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                </button>
                </div>
            </CardContent>
            </Card>
        </div>
      </AuthLayout>
      {/* CSS animations were moved to AuthLayout */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scale-in {
            from {
              transform: scale(0.8);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          .animate-scale-in {
            animation: scale-in 0.5s ease-out;
          }
        `
      }} />
    </div>
  );
};

export default Auth;
