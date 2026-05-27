import { useEffect, useId, useRef } from 'react';
import {
  SAFETY_STATUS_PLAQUE_ICON_SIZE_CLASS,
} from '../../constants/safetyStatusLayout';
import {
  SAFETY_STATUS_FADE_CLASS,
  type SafetyStatusFadePhase,
} from '../../constants/safetyStatusRotation';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { Season } from '../../types';
import { fetchSafetyStatusIconSvg } from '../../utils/fetchSafetyStatusIconSvg';
import { parseSanitizedSafetyStatusIconSvg } from '../../utils/sanitizeSafetyStatusIconSvg';
import { transformSafetyStatusIconSvg } from '../../utils/transformSafetyStatusIconSvg';

const statusFadeOpacityClass = (fadePhase: SafetyStatusFadePhase) =>
  fadePhase === 'hidden' ? 'opacity-0' : 'opacity-100';

type SafetyStatusSeasonIconProps = {
  src: string;
  season: Season;
  fadePhase: SafetyStatusFadePhase;
};

const SafetyStatusSeasonIcon = ({ src, season, fadePhase }: SafetyStatusSeasonIconProps) => {
  const instanceId = useId().replace(/:/g, '');
  const prefersReducedMotion = usePrefersReducedMotion();
  const svgHostRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;
    const gradientId = `safety-status-icon-grad-${instanceId}`;
    const host = svgHostRef.current;

    void fetchSafetyStatusIconSvg(src)
      .then(raw =>
        transformSafetyStatusIconSvg(raw, {
          gradientId,
          season,
          solidHighlight: prefersReducedMotion,
        })
      )
      .then(markup => {
        if (cancelled || !host) return;
        const svg = parseSanitizedSafetyStatusIconSvg(markup);
        host.replaceChildren();
        if (svg) {
          host.appendChild(svg);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [src, season, prefersReducedMotion, instanceId]);

  return (
    <span
      aria-hidden
      className={[
        `inline-block shrink-0 ${SAFETY_STATUS_PLAQUE_ICON_SIZE_CLASS}`,
        SAFETY_STATUS_FADE_CLASS,
        statusFadeOpacityClass(fadePhase),
      ].join(' ')}
    >
      <span
        ref={svgHostRef}
        className="block size-full [&>svg]:h-full [&>svg]:w-full"
      />
    </span>
  );
};

export default SafetyStatusSeasonIcon;
