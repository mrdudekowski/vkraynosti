import { describe, expect, it } from 'vitest';
import { countCmsAdmins, parseCmsUsersFile } from './cmsUsers';

describe('cmsUsers', () => {
  it('считает админов и отвергает пустой список', () => {
    const file = parseCmsUsersFile({
      schemaVersion: 1,
      users: [
        { login: 'admin', password: 'hash', role: 'admin' },
        { login: 'editor', password: 'hash', role: 'editor' },
      ],
    });
    expect(countCmsAdmins(file)).toBe(1);
    expect(() => parseCmsUsersFile({ schemaVersion: 1, users: [] })).toThrow();
  });
});
