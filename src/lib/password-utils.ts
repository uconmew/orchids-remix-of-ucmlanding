import crypto from 'crypto';

/**
 * Generate a cryptographically secure temporary password
 * Format: 12 characters (mix of uppercase, lowercase, numbers, special chars)
 */
export function generatePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const all = uppercase + lowercase + numbers + special;

  let password = '';
  // Ensure at least one of each type
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += special[crypto.randomInt(0, special.length)];

  // Fill remaining characters
  for (let i = password.length; i < 12; i++) {
    password += all[crypto.randomInt(0, all.length)];
  }

  // Shuffle password
  return password
    .split('')
    .sort(() => crypto.randomInt(-1, 2))
    .join('');
}

/**
 * Generate a verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
