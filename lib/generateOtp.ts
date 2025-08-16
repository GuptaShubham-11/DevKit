import crypto from 'crypto';

// Helper to generate secure OTP
function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export { generateOtp };
