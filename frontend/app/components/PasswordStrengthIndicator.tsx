'use client';

export type PasswordStrength = 'weak' | 'medium' | 'strong';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 6) return 'weak';
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Complexity checks
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = calculatePasswordStrength(password);
  
  const strengthConfig = {
    weak: {
      label: 'Слабкий',
      color: 'bg-red-500',
      width: 'w-1/3',
      textColor: 'text-red-600'
    },
    medium: {
      label: 'Середній',
      color: 'bg-yellow-500',
      width: 'w-2/3',
      textColor: 'text-yellow-600'
    },
    strong: {
      label: 'Сильний',
      color: 'bg-green-500',
      width: 'w-full',
      textColor: 'text-green-600'
    }
  };
  
  const config = strengthConfig[strength];
  
  if (!password) return null;
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${config.color} transition-all duration-300 ${config.width}`}
        />
      </div>
    </div>
  );
}
