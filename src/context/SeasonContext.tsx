import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import SeasonFlashOverlay from '../components/layout/SeasonFlashOverlay';
import type { Season } from '../types';
import { getCurrentSeason } from '../utils/getCurrentSeason';
import { SeasonContext } from './season-context-definition';

export const SeasonProvider = ({ children }: { children: ReactNode }) => {
  const [activeSeason, setActiveSeason] = useState<Season>(getCurrentSeason());
  const [flashNonce, setFlashNonce] = useState(0);
  const prevSeasonRef = useRef<Season | null>(null);

  /** Синхронизация с CSS: цвет полосы прокрутки (`index.css`, `html[data-season]`). */
  useLayoutEffect(() => {
    document.documentElement.dataset.season = activeSeason;
  }, [activeSeason]);

  /**
   * Вспышка при любом переходе `activeSeason` (кнопки сезона, dock, синхронизация с URL).
   * `useLayoutEffect`: срабатывает до отрисовки и ловит обновление из `SeasonRouteSync` в том же тике.
   */
  useLayoutEffect(() => {
    if (prevSeasonRef.current === null) {
      prevSeasonRef.current = activeSeason;
      return;
    }
    if (prevSeasonRef.current !== activeSeason) {
      prevSeasonRef.current = activeSeason;
      setFlashNonce(n => n + 1);
    }
  }, [activeSeason]);

  return (
    <SeasonContext.Provider value={{ activeSeason, setActiveSeason }}>
      <Fragment>
        {children}
        {flashNonce > 0 && <SeasonFlashOverlay key={flashNonce} />}
      </Fragment>
    </SeasonContext.Provider>
  );
};
