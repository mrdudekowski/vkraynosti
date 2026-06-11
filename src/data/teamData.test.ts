import { describe, expect, it } from 'vitest';
import { TEAM, TEAM_HERO_PAGES } from './teamData';

describe('teamData portraits', () => {
  it('uses local public team portrait URLs for uploaded portraits', () => {
    expect(TEAM[0].imageUrl).toMatch(/\/team\/team-1\.webp$/);
    expect(TEAM[1].imageUrl).toMatch(/\/team\/team-2\.webp$/);
  });

  it('falls back to placeholder for team-3 and team-4 until files are added', () => {
    expect(TEAM[2].imageUrl).toContain('placehold.co');
    expect(TEAM[3].imageUrl).toContain('placehold.co');
  });
});

describe('TEAM_HERO_PAGES', () => {
  it('defines core team page with Elina above Yaroslav', () => {
    const [top, bottom] = TEAM_HERO_PAGES[0];

    expect(top.name).toBe('Элина');
    expect(bottom.name).toBe('Ярослав');
  });

  it('defines alternate page with Elena above Pavel', () => {
    const [top, bottom] = TEAM_HERO_PAGES[1];

    expect(top.name).toBe('Елена');
    expect(bottom.name).toBe('Павел');
  });
});
