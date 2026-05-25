import { useEffect, useState } from 'react';
import {
  computeTeamZoneBackdropProgress,
  computeTeamZoneFadeInProgress,
  computeTeamZoneFadeOutProgress,
  getHomeContactSectionElement,
  getHomeTeamSectionElement,
  quantizeTeamZoneScrollPx,
} from '../../constants/teamZoneScroll';
import {
  getActiveTeamBackdropExperiments,
  isTeamBackdropDebugEnabled,
  probeViewportBottomElement,
} from '../../utils/teamBackdropDebug';

/**
 * Dev overlay: progress / opacity / rect при `localStorage.debugTeamBackdrop=1`.
 */
export default function TeamBackdropDebugOverlay() {
  const [sample, setSample] = useState<string>('');

  useEffect(() => {
    if (!isTeamBackdropDebugEnabled()) return;

    let raf = 0;
    const tick = () => {
      const vh = window.innerHeight;
      const teamEl = getHomeTeamSectionElement();
      const contactEl = getHomeContactSectionElement();
      const progress = computeTeamZoneBackdropProgress(teamEl, contactEl, vh);
      const teamTop = teamEl ? quantizeTeamZoneScrollPx(teamEl.getBoundingClientRect().top) : null;
      const contactTop = contactEl
        ? quantizeTeamZoneScrollPx(contactEl.getBoundingClientRect().top)
        : null;
      const fadeIn = teamTop != null ? computeTeamZoneFadeInProgress(teamTop, vh) : 0;
      const fadeOut =
        contactTop != null ? computeTeamZoneFadeOutProgress(contactTop, vh) : null;
      const vv = window.visualViewport?.height ?? null;
      const experiments = getActiveTeamBackdropExperiments();
      const bottomHit = probeViewportBottomElement();
      setSample(
        [
          `teamTop ${teamTop?.toFixed(0) ?? '—'}`,
          `contactTop ${contactTop?.toFixed(0) ?? '—'}`,
          `progress ${progress.toFixed(3)}`,
          `fadeIn ${fadeIn.toFixed(3)}`,
          fadeOut != null ? `fadeOut ${fadeOut.toFixed(3)}` : null,
          `vh ${vh}`,
          vv != null ? `vv ${vv.toFixed(0)}` : null,
          bottomHit
            ? `bottom: <${bottomHit.tag}${bottomHit.id ? `#${bottomHit.id}` : ''}> ${bottomHit.classHint}`
            : null,
          bottomHit ? `bottomBg ${bottomHit.backgroundColor}` : null,
          experiments.length ? `AB: ${experiments.join(', ')}` : 'AB: baseline',
        ]
          .filter(Boolean)
          .join('\n')
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!isTeamBackdropDebugEnabled() || !sample) {
    return null;
  }

  return (
    <pre
      className="pointer-events-none fixed bottom-2 left-2 z-[9999] max-w-[min(100vw-1rem,20rem)] rounded bg-black/80 p-2 font-mono text-[10px] leading-tight text-lime-300"
      aria-hidden
    >
      {sample}
    </pre>
  );
}
