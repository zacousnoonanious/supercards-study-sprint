
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { PasswordStrength } from './PasswordStrength';

export const SelfContainedAuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (!isLogin && (!passwordsMatch || passwordStrength < 3)) {
      toast({
        title: "Password Requirements",
        description: "Password must be strong and passwords must match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        // If there's an invite token, redirect to auth page to process it
        if (inviteToken) {
          navigate(`/auth?invite=${inviteToken}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        const redirectUrl = inviteToken 
          ? `${window.location.origin}/auth?invite=${inviteToken}`
          : `${window.location.origin}/dashboard`;
          
        const { error } = await signUp(email, password, { emailRedirectTo: redirectUrl });
        if (error) throw error;
        
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader className="text-center">
        <CardTitle className="text-white text-2xl">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-white/80">
          {isLogin ? 'Sign in to your account' : 'Sign up for SuperCards'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 h-10"
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="text-white text-sm">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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
              <PasswordStrength passwordStrength={passwordStrength} />
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
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/80 hover:text-white text-sm underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
