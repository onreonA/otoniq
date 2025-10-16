/**
 * Password Validation Utilities
 * Enforces password policy and provides strength meter
 */

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    noCommonPatterns: boolean;
  };
  suggestions: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  maxLength?: number;
  forbiddenPatterns?: string[];
}

// Default password policy
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  maxLength: 128,
  forbiddenPatterns: ['password', '123456', 'qwerty', 'admin', 'user', 'test'],
};

/**
 * Validate password against policy
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): PasswordValidationResult {
  const requirements = {
    minLength: password.length >= policy.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    noCommonPatterns: !isCommonPassword(
      password,
      policy.forbiddenPatterns || []
    ),
  };

  // Calculate score (0-100)
  let score = 0;

  // Length score (0-30 points)
  if (requirements.minLength) {
    score += 20;
    if (password.length >= 12) score += 10;
  }

  // Character variety score (0-40 points)
  if (requirements.hasUppercase) score += 8;
  if (requirements.hasLowercase) score += 8;
  if (requirements.hasNumber) score += 8;
  if (requirements.hasSpecialChar) score += 8;
  if (password.length >= 16) score += 8;

  // Complexity score (0-30 points)
  if (requirements.noCommonPatterns) score += 15;
  if (hasNoRepeatingChars(password)) score += 10;
  if (hasNoSequentialChars(password)) score += 5;

  // Determine strength
  let strength: PasswordValidationResult['strength'];
  if (score < 20) strength = 'Very Weak';
  else if (score < 40) strength = 'Weak';
  else if (score < 60) strength = 'Fair';
  else if (score < 80) strength = 'Good';
  else strength = 'Strong';

  // Check if all required requirements are met
  const isValid = Object.values(requirements).every(req => req);

  // Generate suggestions
  const suggestions = generateSuggestions(requirements, policy);

  return {
    isValid,
    score,
    strength,
    requirements,
    suggestions,
  };
}

/**
 * Check if password is a common/weak password
 */
function isCommonPassword(
  password: string,
  forbiddenPatterns: string[]
): boolean {
  const lowerPassword = password.toLowerCase();
  return forbiddenPatterns.some(pattern =>
    lowerPassword.includes(pattern.toLowerCase())
  );
}

/**
 * Check if password has no repeating characters
 */
function hasNoRepeatingChars(password: string): boolean {
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return false;
    }
  }
  return true;
}

/**
 * Check if password has no sequential characters
 */
function hasNoSequentialChars(password: string): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    'qwertyuiopasdfghjklzxcvbnm',
  ];

  for (const sequence of sequences) {
    for (let i = 0; i < sequence.length - 2; i++) {
      const seq = sequence.substring(i, i + 3).toLowerCase();
      if (password.toLowerCase().includes(seq)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Generate password improvement suggestions
 */
function generateSuggestions(
  requirements: PasswordValidationResult['requirements'],
  policy: PasswordPolicy
): string[] {
  const suggestions: string[] = [];

  if (!requirements.minLength) {
    suggestions.push(`En az ${policy.minLength} karakter kullanın`);
  }

  if (!requirements.hasUppercase) {
    suggestions.push('Büyük harf ekleyin (A-Z)');
  }

  if (!requirements.hasLowercase) {
    suggestions.push('Küçük harf ekleyin (a-z)');
  }

  if (!requirements.hasNumber) {
    suggestions.push('Rakam ekleyin (0-9)');
  }

  if (!requirements.hasSpecialChar) {
    suggestions.push('Özel karakter ekleyin (!@#$%^&*)');
  }

  if (!requirements.noCommonPatterns) {
    suggestions.push('Yaygın kelimeler ve kalıplar kullanmayın');
  }

  if (suggestions.length === 0) {
    suggestions.push('Şifre güçlü görünüyor!');
  }

  return suggestions;
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(
  strength: PasswordValidationResult['strength']
): string {
  switch (strength) {
    case 'Very Weak':
      return 'text-red-500';
    case 'Weak':
      return 'text-orange-500';
    case 'Fair':
      return 'text-yellow-500';
    case 'Good':
      return 'text-blue-500';
    case 'Strong':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Get password strength background color
 */
export function getPasswordStrengthBgColor(
  strength: PasswordValidationResult['strength']
): string {
  switch (strength) {
    case 'Very Weak':
      return 'bg-red-500';
    case 'Weak':
      return 'bg-orange-500';
    case 'Fair':
      return 'bg-yellow-500';
    case 'Good':
      return 'bg-blue-500';
    case 'Strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Check if password meets minimum requirements for registration
 */
export function meetsMinimumRequirements(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): boolean {
  const result = validatePassword(password, policy);
  return result.isValid;
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';

  // Ensure at least one character from each required category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
