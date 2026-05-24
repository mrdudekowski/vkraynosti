import { describe, expect, it } from 'vitest';
import { TEAM } from './teamData';

describe('teamData portraits', () => {
  it('uses local public team portrait URLs', () => {
    expect(TEAM[0].imageUrl).toMatch(/\/team\/team-1\.webp$/);
    expect(TEAM[1].imageUrl).toMatch(/\/team\/team-2\.webp$/);
  });
});
