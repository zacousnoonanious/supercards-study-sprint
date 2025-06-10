
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useEffect as useReactEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { useI18n } from '@/contexts/I18nContext';
import { Eye, EyeOff, Check, X } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useI18n();

  useReactEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  // Animated flashcards data
  const flashcards = [
    { front: "Welcome!", back: "Start your learning journey", delay: 0, angle: 0 },
    { front: "Study Smart", back: "Effective spaced repetition", delay: 0.5, angle: 45 },
    { front: "Track Progress", back: "Monitor your improvement", delay: 1, angle: 90 },
    { front: "AI Powered", back: "Generate cards with AI", delay: 1.5, angle: 135 },
    { front: "Share & Learn", back: "Collaborate with others", delay: 2, angle: 180 },
    { front: "Mobile Ready", back: "Study anywhere, anytime", delay: 2.5, angle: 225 },
    { front: "Custom Themes", back: "Personalize your experience", delay: 3, angle: 270 },
    { front: "Analytics", back: "Detailed learning insights", delay: 3.5, angle: 315 },
  ];

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
          setTimeout(() => setShowCelebration(false), 5000);
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
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <Navigation />
        
        {/* Celebration confetti animation */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-16">
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
                  onClick={() => setShowCelebration(false)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navigation />
      
      {/* Animated gradient background similar to homepage */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-blue-600 pt-12">
        {/* Geometric shapes scattered in background */}
        <div 
          className="absolute top-20 left-10 w-8 h-8 bg-pink-300 rounded-full opacity-70 animate-float"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div 
          className="absolute top-32 right-20 w-6 h-6 bg-blue-300 opacity-60 animate-float-slow"
          style={{ 
            transform: `translateY(${scrollY * 0.15}px) rotate(45deg)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div 
          className="absolute bottom-40 right-10 w-10 h-10 bg-purple-300 rounded-full opacity-60 animate-float"
          style={{ transform: `translateY(${scrollY * 0.12}px)` }}
        ></div>
      </div>

      {/* Animated flashcards emanating from center like sun rays */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {flashcards.map((card, index) => (
          <div
            key={index}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(-50%, -50%) rotate(${card.angle}deg) translateY(-200px) rotate(-${card.angle}deg)`,
              animation: `orbit 20s linear infinite`,
              animationDelay: `${card.delay}s`
            }}
          >
            <div 
              className="w-32 h-20 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 p-3 flex items-center justify-center animate-float-cards"
              style={{ animationDelay: `${card.delay}s` }}
            >
              <div className="text-center">
                <p className="text-xs font-semibold text-purple-800">{card.front}</p>
                <p className="text-xs text-purple-600 mt-1">{card.back}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-16">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">{t('auth.title')}</CardTitle>
            <CardDescription className="text-white/80">
              {isLogin ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('auth.emailPlaceholder')}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-white">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('auth.passwordPlaceholder')}
                    minLength={6}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {!isLogin && password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/80">{getStrengthText(passwordStrength)}</span>
                    </div>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your password"
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {confirmPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      {passwordsMatch ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <X className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`text-xs ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                        {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm" 
                disabled={loading || (!isLogin && (!passwordsMatch || passwordStrength < 3))}
              >
                {loading ? t('auth.loading') : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
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

      {/* Additional styles for orbit animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes orbit {
            from {
              transform: translate(-50%, -50%) rotate(0deg) translateY(-200px) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(360deg) translateY(-200px) rotate(-360deg);
            }
          }
          
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
