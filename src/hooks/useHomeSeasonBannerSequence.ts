import { useEffect, useState } from 'react';

import {
  HOME_SEASON_BANNER_CROSSFADE_MS,
  HOME_SEASON_BANNER_CYCLE_GAP_MS,
  HOME_SEASON_BANNER_FULL_WORD_HOLD_MS,
  HOME_SEASON_BANNER_LETTER_FADE_IN_MS,
  HOME_SEASON_BANNER_MEDIA_VISIBLE_MS,
  HOME_SEASON_BANNER_LETTER_EXIT_MS,
  HOME_SEASON_BANNER_STRIP_ENTER_RAF_MS,
  HOME_SEASON_BANNER_STRIP_FADE_IN_MS,
  HOME_SEASON_BANNER_WORD_EXIT_WAVE_STAGGER_MS,
} from '../constants/homeSeasonBannerAnimation';

export type HomeSeasonBannerSoloPhase = 'entering' | 'hold';

export type HomeSeasonBannerWordOverlay = 'hidden' | 'fadingIn' | 'visible' | 'fadingOut';

export interface HomeSeasonBannerSequenceState {
  soloCol: number | null;
  soloPhase: HomeSeasonBannerSoloPhase | null;
  handoff: { from: number; to: number } | null;
  /** После rAF колонка `handoff.to` синхронно с `from` уходит в fade in. */
  handoffToReady: boolean;
  wordOverlay: HomeSeasonBannerWordOverlay;
  /** В фазе `fadingIn`: после rAF включается opacity букв (как у полосок). */
  wordOverlayFadeInReady: boolean;
  /**
   * Волна сноса слова 9→0: правый индекс ещё видимой буквы; `null` вне волны.
   * Только обычный режим; при `prefers-reduced-motion` всегда `null`.
   */
  wordExitWaveLastVisible: number | null;
}

/**
 * Цепочка 0→9: fade in первой полоски → удержание → crossfade i→i+1 (out и in одновременно) → …
 * Затем слово «Вкрайности» (fade in → пауза → волна сноса 9→0: покачивание + fade, см. keyframes в теме) → пауза → повтор.
 * При `prefers-reduced-motion` — только слово, без видео-цикла.
 * Пока `sequenceActive === false`, таймеры не ставятся (ворота вне вьюпорта).
 * `sequenceResetKey` (например сезон) — полный перезапуск таймлайна при смене без смены `sequenceActive`.
 */
export function useHomeSeasonBannerSequence(
  prefersReducedMotion: boolean,
  sequenceActive: boolean,
  sequenceResetKey: string
): HomeSeasonBannerSequenceState {
  const [soloCol, setSoloCol] = useState<number | null>(null);
  const [soloPhase, setSoloPhase] = useState<HomeSeasonBannerSoloPhase | null>(null);
  const [handoff, setHandoff] = useState<{ from: number; to: number } | null>(null);
  const [handoffToReady, setHandoffToReady] = useState(false);
  const [wordOverlay, setWordOverlay] = useState<HomeSeasonBannerWordOverlay>('hidden');
  const [wordOverlayFadeInReady, setWordOverlayFadeInReady] = useState(false);
  const [wordExitWaveLastVisible, setWordExitWaveLastVisible] = useState<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setSoloCol(null);
      setSoloPhase(null);
      setHandoff(null);
      setHandoffToReady(false);
      setWordOverlay('visible');
      setWordOverlayFadeInReady(false);
      setWordExitWaveLastVisible(null);
      return;
    }

    if (!sequenceActive) {
      setSoloCol(null);
      setSoloPhase(null);
      setHandoff(null);
      setHandoffToReady(false);
      setWordOverlay('hidden');
      setWordOverlayFadeInReady(false);
      setWordExitWaveLastVisible(null);
      return;
    }

    setSoloCol(null);
    setSoloPhase(null);
    setHandoff(null);
    setHandoffToReady(false);
    setWordOverlay('hidden');
    setWordOverlayFadeInReady(false);
    setWordExitWaveLastVisible(null);

    let cancelled = false;
    const schedule = (ms: number, fn: () => void) =>
      window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);

    const soloHoldAfterFadeIn =
      HOME_SEASON_BANNER_STRIP_ENTER_RAF_MS +
      HOME_SEASON_BANNER_STRIP_FADE_IN_MS +
      HOME_SEASON_BANNER_MEDIA_VISIBLE_MS;

    const startCol0 = () => {
      if (cancelled) return;
      setSoloCol(0);
      setSoloPhase('entering');
      schedule(HOME_SEASON_BANNER_STRIP_ENTER_RAF_MS, () => {
        if (cancelled) return;
        setSoloPhase('hold');
      });
      schedule(soloHoldAfterFadeIn, () => afterSoloHold(0));
    };

    const afterSoloHold = (col: number) => {
      if (cancelled) return;
      if (col >= 9) {
        startWordPhase();
        return;
      }
      const next = col + 1;
      setHandoff({ from: col, to: next });
      setHandoffToReady(false);
      schedule(HOME_SEASON_BANNER_STRIP_ENTER_RAF_MS, () => {
        if (cancelled) return;
        setHandoffToReady(true);
      });
      schedule(
        HOME_SEASON_BANNER_STRIP_ENTER_RAF_MS + HOME_SEASON_BANNER_CROSSFADE_MS,
        () => {
          if (cancelled) return;
          setHandoff(null);
          setHandoffToReady(false);
          setSoloCol(next);
          setSoloPhase('hold');
          schedule(HOME_SEASON_BANNER_MEDIA_VISIBLE_MS, () => afterSoloHold(next));
        }
      );
    };

    const startWordPhase = () => {
      if (cancelled) return;
      setSoloCol(null);
      setSoloPhase(null);
      setHandoff(null);
      setHandoffToReady(false);
      setWordOverlayFadeInReady(false);
      setWordOverlay('fadingIn');
      schedule(HOME_SEASON_BANNER_STRIP_ENTER_RAF_MS, () => {
        if (cancelled) return;
        setWordOverlayFadeInReady(true);
      });
      schedule(HOME_SEASON_BANNER_STRIP_ENTER_RAF_MS + HOME_SEASON_BANNER_LETTER_FADE_IN_MS, () => {
        if (cancelled) return;
        setWordOverlay('visible');
        setWordOverlayFadeInReady(false);
        schedule(HOME_SEASON_BANNER_FULL_WORD_HOLD_MS, () => {
          if (cancelled) return;
          setWordOverlay('fadingOut');
          setWordExitWaveLastVisible(9);
          for (let k = 0; k <= 9; k++) {
            schedule(k * HOME_SEASON_BANNER_WORD_EXIT_WAVE_STAGGER_MS, () => {
              if (cancelled) return;
              setWordExitWaveLastVisible(9 - k - 1);
              if (k === 9) {
                schedule(HOME_SEASON_BANNER_LETTER_EXIT_MS, () => {
                  if (cancelled) return;
                  setWordOverlay('hidden');
                  setWordExitWaveLastVisible(null);
                  schedule(HOME_SEASON_BANNER_CYCLE_GAP_MS, () => startCol0());
                });
              }
            });
          }
        });
      });
    };

    schedule(HOME_SEASON_BANNER_CYCLE_GAP_MS, () => startCol0());

    return () => {
      cancelled = true;
    };
  }, [prefersReducedMotion, sequenceActive, sequenceResetKey]);

  return {
    soloCol,
    soloPhase,
    handoff,
    handoffToReady,
    wordOverlay,
    wordOverlayFadeInReady,
    wordExitWaveLastVisible,
  };
}
