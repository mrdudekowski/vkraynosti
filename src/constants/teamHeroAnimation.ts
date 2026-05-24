import type { CSSProperties } from 'react';

/** Длительность fade-in одного элемента каскада; синхронно с `animation.team-hero-text-stagger-in`. */
export const TEAM_HERO_TEXT_STAGGER_DURATION_MS = 480 as const;

/** Задержка между элементами каскада (имя → должность → experience? → bio). */
export const TEAM_HERO_TEXT_STAGGER_STEP_MS = 80 as const;

/**
 * Смещение по Y в keyframe; совпадает с `spacing.reveal-y` в tailwind.config.ts.
 */
export const TEAM_HERO_TEXT_STAGGER_TRANSLATE_Y_REM = 1.25 as const;

/** CSS-класс каскада; синхронно с `.team-hero-text-stagger` в `index.css`. */
export const TEAM_HERO_TEXT_STAGGER_CLASS = 'team-hero-text-stagger' as const;

export interface TeamHeroTextStaggerPresentation {
  className: string;
  style?: CSSProperties;
}

/**
 * Inline-стиль задержки для элемента каскада: 0=имя, 1=должность, 2=experience?, далее bio.
 */
export function getTeamHeroTextStaggerStyle(cascadeIndex: number): CSSProperties {
  const safeIndex = Math.max(0, cascadeIndex);
  return {
    animationDelay: `${safeIndex * TEAM_HERO_TEXT_STAGGER_STEP_MS}ms`,
    animationFillMode: 'both',
  };
}

/**
 * className + style для одного элемента каскада; при reduced motion — без анимации и delay.
 */
export function getTeamHeroTextStaggerPresentation(
  cascadeIndex: number,
  prefersReducedMotion: boolean
): TeamHeroTextStaggerPresentation {
  if (prefersReducedMotion) {
    return { className: '' };
  }

  return {
    className: TEAM_HERO_TEXT_STAGGER_CLASS,
    style: getTeamHeroTextStaggerStyle(cascadeIndex),
  };
}
