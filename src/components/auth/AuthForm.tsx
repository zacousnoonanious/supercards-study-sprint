
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/contexts/I18nContext';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { PasswordStrength } from './PasswordStrength';

interface AuthFormProps {
  isLogin: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  passwordStrength: number;
  passwordsMatch: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  handleSubmit,
  loading,
  passwordStrength,
  passwordsMatch,
}) => {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
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
        {loading ? t('auth.loading') : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
      </Button>
    </form>
  );
};
