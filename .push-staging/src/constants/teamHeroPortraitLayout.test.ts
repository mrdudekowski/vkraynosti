import { describe, expect, it } from 'vitest';
import {
  TEAM_HERO_DESKTOP_COLUMN_GAP,
  TEAM_HERO_FIRST_MEMBER_BOTTOM_PADDING_MD,
  TEAM_HERO_FIRST_MEMBER_BOTTOM_PADDING_LG,
  TEAM_HERO_MEMBERS_STACK_GAP,
  TEAM_HERO_MEMBERS_STACK_GAP_MOBILE,
  TEAM_HERO_MEMBERS_STACK_GAP_LG,
  TEAM_HERO_MOBILE_VERTICAL_GAP,
  TEAM_HERO_PORTRAIT_DESKTOP_MAX_HEIGHT,
  TEAM_HERO_PORTRAIT_MOBILE_MAX_HEIGHT,
  TEAM_HERO_SLIDE_MAX_WIDTH,
  TEAM_HERO_SLIDE_MOBILE_ROW_GAP,
  TEAM_HERO_STAIRCASE_OFFSET_LG,
  TEAM_HERO_STAIRCASE_OFFSET_MD,
  TEAM_HERO_BIO_LINE_HEIGHT,
  TEAM_HERO_MEMBER_ID_DESKTOP_TEXT_ALIGN_END,
} from './teamHeroPortraitLayout';

describe('teamHeroPortraitLayout', () => {
  it('uses mobile portrait max-height', () => {
    expect(TEAM_HERO_PORTRAIT_MOBILE_MAX_HEIGHT).toBe('clamp(20rem, 52vh, 32rem)');
  });

  it('uses desktop portrait max-height', () => {
    expect(TEAM_HERO_PORTRAIT_DESKTOP_MAX_HEIGHT).toBe('clamp(22rem, 62vh, 48rem)');
  });

  it('uses desktop column gap', () => {
    expect(TEAM_HERO_DESKTOP_COLUMN_GAP).toBe('1.5rem');
  });

  it('uses slide max-width for desktop centering', () => {
    expect(TEAM_HERO_SLIDE_MAX_WIDTH).toBe('min(100%, 56rem)');
  });

  it('uses mobile row gap between photo and text', () => {
    expect(TEAM_HERO_SLIDE_MOBILE_ROW_GAP).toBe('2rem');
    expect(TEAM_HERO_SLIDE_MOBILE_ROW_GAP).toBe(TEAM_HERO_MOBILE_VERTICAL_GAP);
  });

  it('uses members stack gap tokens', () => {
    expect(TEAM_HERO_MEMBERS_STACK_GAP_MOBILE).toBe('3rem');
    expect(TEAM_HERO_MEMBERS_STACK_GAP_MOBILE).not.toBe(TEAM_HERO_MOBILE_VERTICAL_GAP);
    expect(TEAM_HERO_MEMBERS_STACK_GAP).toBe('3rem');
    expect(TEAM_HERO_MEMBERS_STACK_GAP_LG).toBe('4rem');
  });

  it('uses staircase offset tokens for photo-end lift', () => {
    expect(TEAM_HERO_STAIRCASE_OFFSET_MD).toBe('clamp(6rem, 16vw, 10rem)');
    expect(TEAM_HERO_STAIRCASE_OFFSET_LG).toBe('clamp(7rem, 14vw, 12rem)');
  });

  it('pairs first-member bottom padding with staircase per breakpoint', () => {
    expect(TEAM_HERO_FIRST_MEMBER_BOTTOM_PADDING_MD).toBe('calc(clamp(6rem, 16vw, 10rem) - 1rem)');
    expect(TEAM_HERO_FIRST_MEMBER_BOTTOM_PADDING_LG).toBe('calc(clamp(7rem, 14vw, 12rem) - 2rem)');
  });

  it('uses bio line height token for team-hero prose', () => {
    expect(TEAM_HERO_BIO_LINE_HEIGHT).toBe('1.42');
  });

  it('marks Yaroslav for desktop text row-end alignment', () => {
    expect(TEAM_HERO_MEMBER_ID_DESKTOP_TEXT_ALIGN_END).toBe('team-1');
  });
});
