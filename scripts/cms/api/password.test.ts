/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { hashCmsPassword, verifyCmsPassword } from './password';

describe('cms password', () => {
  it('проверяет хеш и отвергает чужой пароль', () => {
    const stored = hashCmsPassword('local-secret');
    expect(verifyCmsPassword('local-secret', stored)).toBe(true);
    expect(verifyCmsPassword('other-secret', stored)).toBe(false);
  });
});
