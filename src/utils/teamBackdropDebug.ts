/** Dev-only флаги и логи для расследования шторы #team (см. docs/TEAM_MOBILE_SCROLL_BACKDROP_DEBUG_AGENT_PROMPT.md). */

const DEBUG_KEY = 'debugTeamBackdrop';
const HIDE_KEY = 'debugTeamBackdropHide';
const BINARY_KEY = 'debugTeamBackdropBinary';
const PARALLAX_OFF_KEY = 'debugTeamParallaxOff';
const SECTION_BG_KEY = 'debugTeamSectionBg';

function readFlag(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function isTeamBackdropDebugEnabled(): boolean {
  return import.meta.env.DEV && readFlag(DEBUG_KEY);
}

export function isTeamBackdropDebugHide(): boolean {
  return import.meta.env.DEV && readFlag(HIDE_KEY);
}

export function isTeamBackdropDebugBinaryOpacity(): boolean {
  return import.meta.env.DEV && readFlag(BINARY_KEY);
}

export function isTeamParallaxDebugOff(): boolean {
  return import.meta.env.DEV && readFlag(PARALLAX_OFF_KEY);
}

export function isTeamSectionDebugOpaqueBg(): boolean {
  return import.meta.env.DEV && readFlag(SECTION_BG_KEY);
}

let lastLogAt = 0;
let lastProgressLogged = -1;

export interface ViewportBottomHit {
  tag: string;
  id: string;
  classHint: string;
  backgroundColor: string;
  backgroundImage: string;
}

export interface TeamBackdropDebugSample {
  teamTop: number;
  contactTop: number | null;
  progress: number;
  opacity: number;
  innerHeight: number;
  visualViewportHeight: number | null;
  fadeIn: number;
  fadeOut: number | null;
  experiment?: string;
  bottomHit?: ViewportBottomHit | null;
  backdropOpacity?: number | null;
  skyTransform?: string | null;
}

/** Какой DOM-элемент рисуется внизу viewport (центр, ~12px от низа). */
export function probeViewportBottomElement(): ViewportBottomHit | null {
  if (typeof document === 'undefined') return null;
  const x = Math.round(window.innerWidth / 2);
  const y = Math.max(0, Math.round((window.visualViewport?.height ?? window.innerHeight) - 12));
  const el = document.elementFromPoint(x, y);
  if (!el || !(el instanceof HTMLElement)) return null;
  const style = getComputedStyle(el);
  const className = el.className;
  const classHint =
    typeof className === 'string'
      ? className.split(/\s+/).slice(0, 4).join(' ')
      : '';
  return {
    tag: el.tagName.toLowerCase(),
    id: el.id,
    classHint,
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundImage?.slice(0, 80) ?? '',
  };
}

/** Throttle: не чаще 80ms и при смене progress ≥ 0.02. */
export function shouldEmitTeamBackdropDebugLog(progress: number): boolean {
  if (!isTeamBackdropDebugEnabled()) return false;
  const now = Date.now();
  const progressDelta = Math.abs(progress - lastProgressLogged);
  if (now - lastLogAt < 80 && progressDelta < 0.02) return false;
  lastLogAt = now;
  lastProgressLogged = progress;
  return true;
}

export function emitTeamBackdropDebugLog(
  location: string,
  message: string,
  data: TeamBackdropDebugSample & { hypothesisId?: string },
  hypothesisId = 'H1'
): void {
  if (!isTeamBackdropDebugEnabled()) return;
  // #region agent log
  fetch('http://127.0.0.1:7891/ingest/4fbd1f0b-079c-4294-b051-a849c369031c', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '3559be' },
    body: JSON.stringify({
      sessionId: '3559be',
      runId: 'phase1',
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export function getActiveTeamBackdropExperiments(): string[] {
  const experiments: string[] = [];
  if (isTeamBackdropDebugHide()) experiments.push('A:hide-backdrop');
  if (isTeamBackdropDebugBinaryOpacity()) experiments.push('B:binary-opacity');
  if (isTeamParallaxDebugOff()) experiments.push('D:parallax-off');
  if (isTeamSectionDebugOpaqueBg()) experiments.push('E:team-section-bg');
  return experiments;
}
