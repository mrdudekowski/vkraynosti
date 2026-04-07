import { useEffect, useMemo, useRef, type CSSProperties } from 'react';

import {
  HOME_SEASON_BANNER_WORDMARK_GRADIENT_BG_CLASS,
  HOME_SEASON_BANNER_WORDMARK_SOLID_TEXT_CLASS,
} from '../../constants/seasonTheme';
import { UI } from '../../constants/ui';
import { getHomeSeasonBannerClips, type HomeSeasonBannerClip } from '../../data/homeSeasonBannerClips';
import {
  useHomeSeasonBannerSequence,
  type HomeSeasonBannerWordOverlay,
} from '../../hooks/useHomeSeasonBannerSequence';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { Season } from '../../types';

interface HomeSeasonBannerProps {
  season: Season;
}

interface BannerColumnVideoProps {
  clip: HomeSeasonBannerClip;
  playing: boolean;
}

const BannerColumnVideo = ({ clip, playing }: BannerColumnVideoProps) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) {
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [playing]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !clip.videoSrc) return;
    const loopSegment = () => {
      if (v.currentTime >= clip.startSec + clip.durationSec) {
        v.currentTime = clip.startSec;
      }
    };
    v.addEventListener('timeupdate', loopSegment);
    return () => v.removeEventListener('timeupdate', loopSegment);
  }, [clip.videoSrc, clip.startSec, clip.durationSec]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !clip.videoSrc) return;
    const onMeta = () => {
      v.currentTime = clip.startSec;
    };
    v.addEventListener('loadedmetadata', onMeta);
    if (v.readyState >= 1) {
      onMeta();
    }
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [clip.videoSrc, clip.startSec]);

  if (!clip.videoSrc) {
    return null;
  }

  return (
    <video
      ref={ref}
      className="pointer-events-none h-full min-h-0 w-full object-cover"
      src={clip.videoSrc}
      poster={clip.posterSrc}
      muted
      playsInline
      preload="metadata"
      aria-hidden
    />
  );
};

interface ColumnMediaVisual {
  opacityClass: string;
  transitionClass: string;
  /** Входящая колонка при crossfade — чуть выше по z, чтобы лента читалась поверх соседа. */
  liftZ: boolean;
}

function getColumnMediaVisual(
  columnIndex: number,
  wordOverlay: HomeSeasonBannerWordOverlay,
  soloCol: number | null,
  soloPhase: 'entering' | 'hold' | null,
  handoff: { from: number; to: number } | null,
  handoffToReady: boolean
): ColumnMediaVisual {
  if (wordOverlay !== 'hidden') {
    return {
      opacityClass: 'opacity-0',
      transitionClass: 'transition-opacity duration-home-season-banner-crossfade ease-in-out',
      liftZ: false,
    };
  }

  if (handoff) {
    if (columnIndex === handoff.from) {
      return {
        opacityClass: 'opacity-0',
        transitionClass: 'transition-opacity duration-home-season-banner-crossfade ease-in-out',
        liftZ: false,
      };
    }
    if (columnIndex === handoff.to) {
      if (!handoffToReady) {
        return { opacityClass: 'opacity-0', transitionClass: '', liftZ: true };
      }
      return {
        opacityClass: 'opacity-100',
        transitionClass: 'transition-opacity duration-home-season-banner-crossfade ease-in-out',
        liftZ: true,
      };
    }
    return { opacityClass: 'opacity-0', transitionClass: '', liftZ: false };
  }

  if (soloCol === columnIndex) {
    if (soloPhase === 'entering') {
      return { opacityClass: 'opacity-0', transitionClass: '', liftZ: false };
    }
    if (soloPhase === 'hold') {
      return {
        opacityClass: 'opacity-100',
        transitionClass: 'transition-opacity duration-home-season-banner-strip-in ease-in-out',
        liftZ: false,
      };
    }
  }

  return { opacityClass: 'opacity-0', transitionClass: '', liftZ: false };
}

/** Буква под медиа: видна после crossfade из колонки (накапливаются слева направо до финального слова). */
function isHomeSeasonBannerLetterUnderlayVisible(
  columnIndex: number,
  soloCol: number | null,
  soloPhase: 'entering' | 'hold' | null,
  handoff: { from: number; to: number } | null
): boolean {
  if (handoff) {
    return columnIndex < handoff.to;
  }
  if (soloCol === null || soloPhase === null) {
    return false;
  }
  return columnIndex < soloCol;
}

function wordLetterOpacityClass(
  phase: HomeSeasonBannerWordOverlay,
  prefersReducedMotion: boolean,
  fadeInReady: boolean,
  columnIndex: number,
  soloCol: number | null,
  soloPhase: 'entering' | 'hold' | null,
  handoff: { from: number; to: number } | null,
  wordExitWaveLastVisible: number | null
): string {
  if (prefersReducedMotion) {
    return 'opacity-100';
  }
  if (phase === 'hidden') {
    return isHomeSeasonBannerLetterUnderlayVisible(columnIndex, soloCol, soloPhase, handoff)
      ? 'opacity-100'
      : 'opacity-0';
  }
  if (phase === 'fadingIn') {
    return fadeInReady ? 'opacity-100' : 'opacity-0';
  }
  if (phase === 'visible') {
    return 'opacity-100';
  }
  if (phase === 'fadingOut' && wordExitWaveLastVisible !== null) {
    if (columnIndex > wordExitWaveLastVisible + 1) {
      return 'opacity-0';
    }
    return 'opacity-100';
  }
  return 'opacity-0';
}

function wordLetterTransitionClass(
  phase: HomeSeasonBannerWordOverlay,
  prefersReducedMotion: boolean,
  fadeInReady: boolean,
  wordExitWaveLastVisible: number | null
): string {
  if (prefersReducedMotion) {
    return '';
  }
  if (phase === 'hidden') {
    return '';
  }
  if (phase === 'fadingIn' && fadeInReady) {
    return 'transition-opacity duration-home-season-banner-letter-in ease-in-out';
  }
  if (phase === 'fadingOut' && wordExitWaveLastVisible !== null) {
    return '';
  }
  if (phase === 'fadingOut') {
    return 'transition-opacity duration-home-season-banner-letter-exit ease-in-out';
  }
  if (phase === 'visible') {
    return 'transition-opacity duration-home-season-banner-letter-in ease-in-out';
  }
  return '';
}

interface HomeSeasonBannerColumnProps {
  season: Season;
  columnIndex: number;
  letter: string;
  clip: HomeSeasonBannerClip;
  wordOverlay: HomeSeasonBannerWordOverlay;
  soloCol: number | null;
  soloPhase: 'entering' | 'hold' | null;
  handoff: { from: number; to: number } | null;
  handoffToReady: boolean;
  wordOverlayFadeInReady: boolean;
  wordExitWaveLastVisible: number | null;
  prefersReducedMotion: boolean;
}

const HomeSeasonBannerColumn = ({
  season,
  columnIndex,
  letter,
  clip,
  wordOverlay,
  soloCol,
  soloPhase,
  handoff,
  handoffToReady,
  wordOverlayFadeInReady,
  wordExitWaveLastVisible,
  prefersReducedMotion,
}: HomeSeasonBannerColumnProps) => {
  const media = getColumnMediaVisual(
    columnIndex,
    wordOverlay,
    soloCol,
    soloPhase,
    handoff,
    handoffToReady
  );

  const inVideoChain =
    wordOverlay === 'hidden' &&
    (soloCol === columnIndex ||
      (handoff !== null && (handoff.from === columnIndex || handoff.to === columnIndex)));

  const playing = !prefersReducedMotion && inVideoChain;

  const letterOpacity = wordLetterOpacityClass(
    wordOverlay,
    prefersReducedMotion,
    wordOverlayFadeInReady,
    columnIndex,
    soloCol,
    soloPhase,
    handoff,
    wordExitWaveLastVisible
  );
  const letterTransition = wordLetterTransitionClass(
    wordOverlay,
    prefersReducedMotion,
    wordOverlayFadeInReady,
    wordExitWaveLastVisible
  );

  const zClass = media.liftZ ? 'z-10' : 'z-0';

  const isWordWaveExitColumn =
    !prefersReducedMotion &&
    wordOverlay === 'fadingOut' &&
    wordExitWaveLastVisible !== null &&
    columnIndex === wordExitWaveLastVisible + 1;

  const wordmarkAxisCount = UI.homeSeasonBannerWordmark.length - 1;
  const wordmarkAxisPct =
    wordmarkAxisCount > 0 ? (columnIndex / wordmarkAxisCount) * 100 : 0;

  const letterFillClass = prefersReducedMotion
    ? HOME_SEASON_BANNER_WORDMARK_SOLID_TEXT_CLASS[season]
    : [
        HOME_SEASON_BANNER_WORDMARK_GRADIENT_BG_CLASS[season],
        'bg-home-season-banner-wordmark-grid bg-clip-text bg-no-repeat text-transparent',
        isWordWaveExitColumn ? '' : 'animate-home-season-banner-wordmark-shimmer',
      ]
        .filter(Boolean)
        .join(' ');

  const letterGlyphClassName = [
    'block w-full origin-center text-center font-home-season-banner text-home-season-banner-letter drop-shadow-home-season-banner-letter',
    letterFillClass,
    isWordWaveExitColumn ? 'animate-home-season-banner-letter-wave-exit' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const letterGlyphStyle: CSSProperties | undefined = prefersReducedMotion
    ? undefined
    : { ['--hsb-wm-x' as string]: `${String(wordmarkAxisPct)}%` };

  return (
    <div className={`relative h-full min-h-0 min-w-0 ${zClass}`}>
      <div
        className={`absolute inset-0 flex items-center justify-center ${letterTransition} ${letterOpacity}`}
        aria-hidden
      >
        <span className={letterGlyphClassName} style={letterGlyphStyle}>
          {letter}
        </span>
      </div>
      <div
        className={`absolute inset-0 ${media.transitionClass} ${media.opacityClass}`}
        aria-hidden
      >
        {clip.videoSrc ? (
          <BannerColumnVideo clip={clip} playing={playing} />
        ) : (
          <img
            src={clip.posterSrc}
            alt=""
            className="pointer-events-none h-full min-h-0 w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    </div>
  );
};

/**
 * Десять колонок с crossfade видео и словом «Вкрайности» на всех ширинах вьюпорта.
 */
const HomeSeasonBanner = ({ season }: HomeSeasonBannerProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    soloCol,
    soloPhase,
    handoff,
    handoffToReady,
    wordOverlay,
    wordOverlayFadeInReady,
    wordExitWaveLastVisible,
  } = useHomeSeasonBannerSequence(prefersReducedMotion);
  const clips = useMemo(() => getHomeSeasonBannerClips(season), [season]);
  const letters = useMemo(() => [...UI.homeSeasonBannerWordmark], []);

  if (import.meta.env.DEV && letters.length !== 10) {
    console.error('UI.homeSeasonBannerWordmark must contain exactly 10 characters');
  }

  return (
    <section
      className="pointer-events-none relative z-home-season-banner w-full"
      aria-label={UI.sections.homeSeasonBannerRegion}
    >
      <div className="min-h-0 w-full">
        <div className="aspect-home-season-banner-inner min-h-home-season-banner-inner w-full overflow-hidden bg-home-season-banner-stage">
          <div className="grid h-full min-h-0 w-full grid-cols-10" aria-hidden>
            {clips.map((clip, index) => (
              <HomeSeasonBannerColumn
                key={`${season}-${String(index)}`}
                season={season}
                columnIndex={index}
                letter={letters[index] ?? ''}
                clip={clip}
                wordOverlay={wordOverlay}
                soloCol={soloCol}
                soloPhase={soloPhase}
                handoff={handoff}
                handoffToReady={handoffToReady}
                wordOverlayFadeInReady={wordOverlayFadeInReady}
                wordExitWaveLastVisible={wordExitWaveLastVisible}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSeasonBanner;
