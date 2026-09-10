/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { createRawSessionToken, hashSessionToken } from './session.ts';

describe('opaque CMS session tokens', () => {
  it('hashes the token deterministically without exposing it', () => {
    const raw = createRawSessionToken();
    expect(raw).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(hashSessionToken(raw)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashSessionToken(raw)).toBe(hashSessionToken(raw));
    expect(hashSessionToken(raw)).not.toContain(raw);
  });
});
