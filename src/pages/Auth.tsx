import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { WebGLFlashcards } from '@/components/WebGLFlashcards';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useReactEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Effect for 3D card tilt
  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;

      // Normalize mouse position from -1 to 1
      const normalizedX = (x / width) * 2 - 1;
      const normalizedY = (y / height) * 2 - 1;

      const rotateX = -normalizedY * 10; // max 10deg rotation
      const rotateY = normalizedX * 10; // max 10deg rotation

      requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      });
    };

    const handleMouseLeave = () => {
      requestAnimationFrame(() => {
        if (card) {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        }
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
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

  // Flashcard data for WebGL animation
  const flashcardFacts = useMemo(() => [
    { front: "Capital of Japan", back: "Tokyo", color: "#3b82f6" },
    { front: "Speed of Light", back: "299,792,458 m/s", color: "#8b5cf6" },
    { front: "Largest Planet", back: "Jupiter", color: "#f97316" },
    { front: "Chemical Symbol for Gold", back: "Au", color: "#eab308" },
    { front: "Author of 1984", back: "George Orwell", color: "#22c55e" },
    { front: "Pythagorean Theorem", back: "a² + b² = c²", color: "#ef4444" },
    { front: "Capital of France", back: "Paris", color: "#06b6d4" },
    { front: "Smallest Prime Number", back: "2", color: "#ec4899" },
    { front: "Water's Chemical Formula", back: "H₂O", color: "#10b981" },
    { front: "First President of USA", back: "George Washington", color: "#f59e0b" },
    { front: "Atomic Number of Carbon", back: "6", color: "#8b5cf6" },
    { front: "Capital of Italy", back: "Rome", color: "#ef4444" },
    { front: "Continent with Antarctica", back: "Antarctica", color: "#06b6d4" },
    { front: "Square Root of 64", back: "8", color: "#22c55e" },
    { front: "Inventor of the Telephone", back: "Alexander Graham Bell", color: "#f97316" },
    { front: "Largest Ocean", back: "Pacific Ocean", color: "#3b82f6" },
    { front: "Number of Continents", back: "7", color: "#ec4899" },
    { front: "Chemical Symbol for Iron", back: "Fe", color: "#eab308" },
    { front: "Author of Romeo and Juliet", back: "William Shakespeare", color: "#8b5cf6" },
    { front: "Year WWI Ended", back: "1918", color: "#ef4444" }
  ], []);

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
    return (
      <div className="h-screen w-screen fixed inset-0 overflow-hidden bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <Navigation />
        
        {/* Simplified celebration animation */}
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
                  onClick={() => setShowCelebration(false)}
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
  }

  return (
    <div className="h-screen w-screen fixed inset-0 overflow-hidden">
      <Navigation />
      
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-blue-600">
        {/* Simple geometric shapes */}
        <div className="absolute top-20 left-10 w-8 h-8 bg-pink-300 rounded-full opacity-50 animate-float"></div>
        <div 
          className="absolute top-32 right-20 w-6 h-6 bg-blue-300 opacity-40 animate-float-slow"
          style={{ 
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div className="absolute bottom-40 right-10 w-10 h-10 bg-purple-300 rounded-full opacity-40 animate-float"></div>
      </div>

      {/* WebGL Flashcards */}
      <WebGLFlashcards flashcards={flashcardFacts} />

      {/* Content */}
      <div ref={containerRef} className="relative z-10 h-full flex items-center justify-center p-4 pt-16 pb-4">
        <Card ref={cardRef} className="w-full max-w-sm md:max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl transition-transform duration-300 ease-out will-change-transform">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl md:text-3xl font-bold text-white">{t('auth.title')}</CardTitle>
            <CardDescription className="text-white/80 text-sm">
              {isLogin ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white text-sm">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('auth.emailPlaceholder')}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 h-10"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-white text-sm">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('auth.passwordPlaceholder')}
                    minLength={6}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 pr-10 h-10"
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
                      <div className="flex-1 bg-white/20 rounded-full h-1.5">
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
                  <Label htmlFor="confirmPassword" className="text-white text-sm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your password"
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 pr-10 h-10"
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
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
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
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm h-10" 
                disabled={loading || (!isLogin && (!passwordsMatch || passwordStrength < 3))}
              >
                {loading ? t('auth.loading') : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
              </Button>
            </form>
            
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

      {/* CSS animations */}
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
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(45deg); }
            50% { transform: translateY(-10px) rotate(45deg); }
          }
          
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          
          .animate-float-slow {
            animation: float-slow 5s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );
};

export default Auth;
