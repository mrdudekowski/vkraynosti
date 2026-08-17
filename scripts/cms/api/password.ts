import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_PREFIX = 'scrypt';
const SCRYPT_KEYLEN = 32;

export function hashCmsPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${SCRYPT_PREFIX}$${salt}$${derived.toString('hex')}`;
}

export function verifyCmsPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts[0] === SCRYPT_PREFIX && parts.length === 3) {
    const salt = parts[1];
    const hash = parts[2];
    if (salt == null || hash == null || salt.length === 0 || hash.length === 0) {
      return false;
    }
    const derived = scryptSync(password, salt, SCRYPT_KEYLEN);
    const expected = Buffer.from(hash, 'hex');
    if (derived.length !== expected.length) {
      return false;
    }
    return timingSafeEqual(derived, expected);
  }
  const given = Buffer.from(password);
  const want = Buffer.from(stored);
  if (given.length !== want.length) {
    return false;
  }
  return timingSafeEqual(given, want);
}
