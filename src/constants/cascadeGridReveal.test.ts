import { describe, expect, it } from 'vitest';
import {
  CASCADE_GRID_CASCADE_STEP_MS,
  CASCADE_GRID_FADE_OUT_DURATION_MS,
  CASCADE_GRID_REVEAL_DURATION_MS,
  getCascadeGridItemAnimation,
  getCascadeGridTotalDurationMs,
} from './cascadeGridReveal';

describe('cascadeGridReveal', () => {
  it('computes total cascade duration from item count', () => {
    expect(getCascadeGridTotalDurationMs(1)).toBe(CASCADE_GRID_REVEAL_DURATION_MS);
    expect(getCascadeGridTotalDurationMs(3)).toBe(
      CASCADE_GRID_REVEAL_DURATION_MS + 2 * CASCADE_GRID_CASCADE_STEP_MS,
    );
  });

  it('stagger delay caps at max cascade index', () => {
    const anim = getCascadeGridItemAnimation('fadingIn', 20);
    expect(anim.style?.transitionDelay).toBe(`${8 * CASCADE_GRID_CASCADE_STEP_MS}ms`);
  });

  it('uses reveal transition tokens without breakpoint prefixes', () => {
    const anim = getCascadeGridItemAnimation('idle', 0);
    expect(anim.className).toContain('duration-reveal');
    expect(anim.className).not.toMatch(/\b(sm|md|lg|xl|2xl):/);
  });

  it('fade-out duration is shorter than reveal', () => {
    expect(CASCADE_GRID_FADE_OUT_DURATION_MS).toBeLessThan(CASCADE_GRID_REVEAL_DURATION_MS);
  });
});
