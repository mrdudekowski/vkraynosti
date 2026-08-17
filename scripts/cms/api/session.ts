import { createHmac, timingSafeEqual } from 'node:crypto';
import type { CmsApiRole } from './env';

export const CMS_SESSION_COOKIE = 'vkr_cms_session';
export const CMS_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export type CmsSession = {
  sub: string;
  role: CmsApiRole;
  exp: number;
};

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function signCmsSession(session: CmsSession, secret: string): string {
  const payload = toBase64Url(JSON.stringify(session));
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyCmsSession(token: string, secret: string): CmsSession | null {
  const dot = token.indexOf('.');
  if (dot <= 0) {
    return null;
  }
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(payload));
    if (
      parsed == null ||
      typeof parsed !== 'object' ||
      !('sub' in parsed) ||
      !('role' in parsed) ||
      !('exp' in parsed)
    ) {
      return null;
    }
    const session = parsed as CmsSession;
    if (session.role !== 'admin' && session.role !== 'editor') {
      return null;
    }
    if (typeof session.sub !== 'string' || typeof session.exp !== 'number') {
      return null;
    }
    if (Date.now() > session.exp) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function createCmsSession(sub: string, role: CmsApiRole): CmsSession {
  return {
    sub,
    role,
    exp: Date.now() + CMS_SESSION_TTL_MS,
  };
}

export function passwordsMatch(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
