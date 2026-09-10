import { useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useTeamZoneViewportBackdrop } from '../../hooks/useTeamZoneViewportBackdrop';
import TeamBackdropDebugOverlay from './TeamBackdropDebugOverlay';
import { isTeamBackdropDebugHide } from '../../utils/teamBackdropDebug';

/**
 * Фиксированная чёрная штора viewport в зоне `#team` на главной.
 * TODO(navbar): при progress > 0.4 — светлый chrome навбара (см. homeNavbarChrome).
 */
export default function TeamViewportBackdrop() {
  const { pathname } = useLocation();
  const enabled = pathname === ROUTES.HOME;
  const { backdropRef } = useTeamZoneViewportBackdrop({ enabled });

  if (!enabled) {
    return null;
  }

  if (isTeamBackdropDebugHide()) {
    return <TeamBackdropDebugOverlay />;
  }

  return (
    <>
      <div
        ref={backdropRef}
        className="pointer-events-none fixed inset-0 z-home-team-backdrop bg-home-gate-start-screen transition-none will-change-opacity"
        aria-hidden
      />
      <TeamBackdropDebugOverlay />
    </>
  );
}
