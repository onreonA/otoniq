/**
 * Password Strength Meter Component
 * Visual indicator for password strength with requirements
 */

import { useState, useEffect } from 'react';
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthBgColor,
  PasswordValidationResult,
} from '../../../shared/utils/passwordValidation';
import {
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  onChange?: (result: PasswordValidationResult) => void;
  showSuggestions?: boolean;
  showGenerateButton?: boolean;
  onGeneratePassword?: () => void;
  className?: string;
}

export default function PasswordStrengthMeter({
  password,
  onChange,
  showSuggestions = true,
  showGenerateButton = true,
  onGeneratePassword,
  className = '',
}: PasswordStrengthMeterProps) {
  const [validation, setValidation] = useState<PasswordValidationResult | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (password) {
      const result = validatePassword(password);
      setValidation(result);
      onChange?.(result);
    } else {
      setValidation(null);
    }
  }, [password, onChange]);

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  if (!validation) {
    return null;
  }

  const strengthColor = getPasswordStrengthColor(validation.strength);
  const strengthBgColor = getPasswordStrengthBgColor(validation.strength);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Password Input with Toggle */}
      <div className='relative'>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          readOnly
          className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all pr-20'
          placeholder='Şifre girin...'
        />
        <div className='absolute inset-y-0 right-0 flex items-center gap-2 pr-3'>
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='text-gray-400 hover:text-white transition-colors'
          >
            {showPassword ? (
              <EyeOff className='w-5 h-5' />
            ) : (
              <Eye className='w-5 h-5' />
            )}
          </button>
          <button
            type='button'
            onClick={handleCopyPassword}
            className='text-gray-400 hover:text-white transition-colors'
          >
            {copied ? (
              <Check className='w-5 h-5 text-green-400' />
            ) : (
              <Copy className='w-5 h-5' />
            )}
          </button>
        </div>
      </div>

      {/* Strength Meter */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-gray-300'>Şifre Gücü</span>
          <span className={`text-sm font-semibold ${strengthColor}`}>
            {validation.strength}
          </span>
        </div>

        <div className='w-full bg-gray-700 rounded-full h-2'>
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthBgColor}`}
            style={{ width: `${validation.score}%` }}
          />
        </div>

        <div className='text-xs text-gray-400 text-center'>
          {validation.score}/100 puan
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className='space-y-2'>
        <h4 className='text-sm font-medium text-gray-300'>Gereksinimler</h4>
        <div className='space-y-1'>
          {Object.entries(validation.requirements).map(([key, met]) => {
            const labels: Record<string, string> = {
              minLength: 'En az 8 karakter',
              hasUppercase: 'Büyük harf (A-Z)',
              hasLowercase: 'Küçük harf (a-z)',
              hasNumber: 'Rakam (0-9)',
              hasSpecialChar: 'Özel karakter (!@#$%^&*)',
              noCommonPatterns: 'Yaygın kalıplar yok',
            };

            return (
              <div key={key} className='flex items-center gap-2'>
                {met ? (
                  <CheckCircle className='w-4 h-4 text-green-400 flex-shrink-0' />
                ) : (
                  <XCircle className='w-4 h-4 text-red-400 flex-shrink-0' />
                )}
                <span
                  className={`text-sm ${met ? 'text-green-400' : 'text-red-400'}`}
                >
                  {labels[key]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && validation.suggestions.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-gray-300'>Öneriler</h4>
          <ul className='space-y-1'>
            {validation.suggestions.map((suggestion, index) => (
              <li
                key={index}
                className='text-sm text-gray-400 flex items-start gap-2'
              >
                <span className='text-blue-400 mt-0.5'>•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Generate Password Button */}
      {showGenerateButton && onGeneratePassword && (
        <button
          type='button'
          onClick={onGeneratePassword}
          className='w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center justify-center gap-2'
        >
          <RefreshCw className='w-4 h-4' />
          Güvenli Şifre Oluştur
        </button>
      )}
    </div>
  );
}
