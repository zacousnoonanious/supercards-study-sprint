
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

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseMoveRef = useRef(0);

  useReactEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Throttled mouse tracking to reduce performance impact
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    if (now - lastMouseMoveRef.current > 100) { // Throttle to 10fps instead of 60fps
      setMousePos({ x: e.clientX, y: e.clientY });
      lastMouseMoveRef.current = now;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

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

  // Reduced flashcard facts (from 18 to 8 for better performance)
  const flashcardFacts = useMemo(() => [
    { front: "Capital of Japan", back: "Tokyo", color: "bg-blue-100 border-blue-300 text-blue-800" },
    { front: "Speed of Light", back: "299,792,458 m/s", color: "bg-purple-100 border-purple-300 text-purple-800" },
    { front: "Largest Planet", back: "Jupiter", color: "bg-orange-100 border-orange-300 text-orange-800" },
    { front: "Chemical Symbol for Gold", back: "Au", color: "bg-yellow-100 border-yellow-300 text-yellow-800" },
    { front: "Author of 1984", back: "George Orwell", color: "bg-green-100 border-green-300 text-green-800" },
    { front: "Pythagorean Theorem", back: "a² + b² = c²", color: "bg-red-100 border-red-300 text-red-800" },
    { front: "DNA Structure", back: "Double Helix", color: "bg-pink-100 border-pink-300 text-pink-800" },
    { front: "Newton's First Law", back: "Objects at rest stay at rest", color: "bg-emerald-100 border-emerald-300 text-emerald-800" }
  ], []);

  // Simplified movement data with reduced calculations
  const [cardMovements, setCardMovements] = useState(() => 
    flashcardFacts.map((_, index) => ({
      id: index,
      x: Math.random() * 70 + 15, // Keep cards more centered
      y: Math.random() * 70 + 15,
      vx: (Math.random() - 0.5) * 0.3, // Reduced velocity for smoother animation
      vy: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 0.5, // Slower rotation
      flipTimer: Math.random() * 10000,
      isFlipped: false,
      opacity: 0.4 + Math.random() * 0.3
    }))
  );

  // Optimized card movement with requestAnimationFrame and reduced frequency
  useEffect(() => {
    let animationId: number;
    let lastUpdate = 0;
    
    const updateCards = (timestamp: number) => {
      if (timestamp - lastUpdate > 150) { // Update every 150ms instead of 50ms
        setCardMovements(prevMovements => 
          prevMovements.map(movement => {
            const newMovement = { ...movement };
            
            // Simplified mouse repulsion (only when mouse is moving)
            if (containerRef.current && timestamp - lastMouseMoveRef.current < 1000) {
              const rect = containerRef.current.getBoundingClientRect();
              const cardX = (newMovement.x / 100) * rect.width + rect.left;
              const cardY = (newMovement.y / 100) * rect.height + rect.top;
              const mouseDistance = Math.sqrt(
                Math.pow(mousePos.x - cardX, 2) + Math.pow(mousePos.y - cardY, 2)
              );
              
              if (mouseDistance < 120 && mouseDistance > 0) {
                const repulsionForce = (120 - mouseDistance) / 120 * 0.02;
                const angle = Math.atan2(cardY - mousePos.y, cardX - mousePos.x);
                newMovement.vx += Math.cos(angle) * repulsionForce;
                newMovement.vy += Math.sin(angle) * repulsionForce;
              }
            }
            
            // Apply velocity
            newMovement.x += newMovement.vx;
            newMovement.y += newMovement.vy;
            
            // Simple edge bouncing
            if (newMovement.x <= 10 || newMovement.x >= 90) {
              newMovement.vx *= -0.8;
              newMovement.x = Math.max(10, Math.min(90, newMovement.x));
            }
            if (newMovement.y <= 10 || newMovement.y >= 90) {
              newMovement.vy *= -0.8;
              newMovement.y = Math.max(10, Math.min(90, newMovement.y));
            }
            
            // Simplified rotation
            newMovement.rotation += newMovement.rotationSpeed;
            
            // Less frequent random changes
            if (Math.random() < 0.003) {
              newMovement.vx += (Math.random() - 0.5) * 0.1;
              newMovement.vy += (Math.random() - 0.5) * 0.1;
              newMovement.vx = Math.max(-0.5, Math.min(0.5, newMovement.vx));
              newMovement.vy = Math.max(-0.5, Math.min(0.5, newMovement.vy));
            }
            
            // Card flipping
            newMovement.flipTimer += 150;
            if (newMovement.flipTimer > 8000 + Math.random() * 6000) {
              newMovement.isFlipped = !newMovement.isFlipped;
              newMovement.flipTimer = 0;
            }
            
            return newMovement;
          })
        );
        lastUpdate = timestamp;
      }
      animationId = requestAnimationFrame(updateCards);
    };

    animationId = requestAnimationFrame(updateCards);
    return () => cancelAnimationFrame(animationId);
  }, [mousePos]);

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
      <div className="h-screen w-screen fixed inset-0 overflow-hidden bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <Navigation />
        
        {/* Simplified celebration animation */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
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
    <div ref={containerRef} className="h-screen w-screen fixed inset-0 overflow-hidden">
      <Navigation />
      
      {/* Simplified gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-blue-600">
        {/* Reduced geometric shapes */}
        <div className="absolute top-20 left-10 w-8 h-8 bg-pink-300 rounded-full opacity-50 animate-float"></div>
        <div 
          className="absolute top-32 right-20 w-6 h-6 bg-blue-300 opacity-40 animate-float-slow"
          style={{ 
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div className="absolute bottom-40 right-10 w-10 h-10 bg-purple-300 rounded-full opacity-40 animate-float"></div>
      </div>

      {/* Optimized floating flashcards */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
        {flashcardFacts.map((card, index) => {
          const movement = cardMovements[index];
          return (
            <div
              key={index}
              className="absolute will-change-transform"
              style={{
                left: `${movement.x}%`,
                top: `${movement.y}%`,
                transform: `translate3d(-50%, -50%, 0) rotate(${movement.rotation}deg)`,
                opacity: movement.opacity,
              }}
            >
              <div className="w-28 h-18 md:w-32 md:h-20 [perspective:1000px] drop-shadow-md">
                <div
                  className="relative w-full h-full transition-transform duration-700 ease-in-out will-change-transform"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: movement.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front of card */}
                  <div className={`absolute inset-0 w-full h-full ${card.color} border rounded-lg shadow-lg p-2 md:p-3 flex items-center justify-center [backface-visibility:hidden]`}>
                    <p className="text-xs font-semibold text-center leading-tight">{card.front}</p>
                  </div>
                  {/* Back of card */}
                  <div 
                    className={`absolute inset-0 w-full h-full ${card.color} border rounded-lg shadow-lg p-2 md:p-3 flex items-center justify-center [backface-visibility:hidden]`}
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <p className="text-xs font-medium text-center leading-tight">{card.back}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-4 pt-16 pb-4">
        <Card className="w-full max-w-sm md:max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
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

      {/* Simplified CSS animations */}
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
