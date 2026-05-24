import { describe, expect, it } from 'vitest';
import {
  getTeamHeroTextStaggerPresentation,
  getTeamHeroTextStaggerStyle,
  TEAM_HERO_TEXT_STAGGER_CLASS,
  TEAM_HERO_TEXT_STAGGER_STEP_MS,
} from './teamHeroAnimation';

describe('getTeamHeroTextStaggerStyle', () => {
  it('returns zero delay for cascade index 0', () => {
    expect(getTeamHeroTextStaggerStyle(0)).toEqual({
      animationDelay: '0ms',
      animationFillMode: 'both',
    });
  });

  it('scales delay by cascade index and step ms', () => {
    expect(getTeamHeroTextStaggerStyle(1)).toEqual({
      animationDelay: `${TEAM_HERO_TEXT_STAGGER_STEP_MS}ms`,
      animationFillMode: 'both',
    });
    expect(getTeamHeroTextStaggerStyle(2)).toEqual({
      animationDelay: `${TEAM_HERO_TEXT_STAGGER_STEP_MS * 2}ms`,
      animationFillMode: 'both',
    });
  });

  it('clamps negative index to zero delay', () => {
    expect(getTeamHeroTextStaggerStyle(-1).animationDelay).toBe('0ms');
  });
});

describe('getTeamHeroTextStaggerPresentation', () => {
  it('returns stagger class and style when motion is allowed', () => {
    expect(getTeamHeroTextStaggerPresentation(1, false)).toEqual({
      className: TEAM_HERO_TEXT_STAGGER_CLASS,
      style: getTeamHeroTextStaggerStyle(1),
    });
  });

  it('returns empty presentation when reduced motion is preferred', () => {
    expect(getTeamHeroTextStaggerPresentation(2, true)).toEqual({
      className: '',
    });
  });

  it('hides text until scroll reveal when motion is allowed', () => {
    expect(getTeamHeroTextStaggerPresentation(1, false, false)).toEqual({
      className: 'opacity-0',
    });
  });
});
