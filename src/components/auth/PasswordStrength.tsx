
import React from 'react';

interface PasswordStrengthProps {
  passwordStrength: number;
}

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

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ passwordStrength }) => {
  return (
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
  );
};
