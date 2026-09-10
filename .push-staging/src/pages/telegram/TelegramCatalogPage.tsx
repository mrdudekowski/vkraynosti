import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Season } from '../../types';
import { UI } from '../../constants/ui';
import { parseTelegramSeasonSearchParam } from '../../constants/telegramMiniApp';
import TelegramCatalogHero from '../../components/telegram/TelegramCatalogHero';
import SeasonTabs from '../../components/telegram/SeasonTabs';
import TelegramMiniAppShell from '../../components/telegram/TelegramMiniAppShell';
import TelegramTourCard from '../../components/telegram/TelegramTourCard';
import { useVisibleToursBySeason } from '../../hooks/useVisibleToursBySeason';

const DEFAULT_SEASON: Season = 'summer';

const TelegramCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const seasonFromUrl = parseTelegramSeasonSearchParam(searchParams.get('season'));
  const activeSeason = seasonFromUrl ?? DEFAULT_SEASON;
  const { tours, scheduleLoaded } = useVisibleToursBySeason(activeSeason);

  useEffect(() => {
    if (seasonFromUrl == null) {
      setSearchParams({ season: activeSeason }, { replace: true });
    }
  }, [activeSeason, seasonFromUrl, setSearchParams]);

  const handleSeasonChange = (season: Season) => {
    setSearchParams({ season }, { replace: true });
  };

  const content = useMemo(() => {
    if (!scheduleLoaded) {
      return (
        <p className="py-8 text-center text-sm text-text-muted">
          {UI.telegramMiniApp.catalogLoading}
        </p>
      );
    }
    if (tours.length === 0) {
      return (
        <p className="py-8 text-center text-sm text-text-muted">
          {UI.telegramMiniApp.catalogEmpty}
        </p>
      );
    }
    return (
      <ul className="flex flex-col gap-5">
        {tours.map(tour => (
          <li key={tour.id}>
            <TelegramTourCard tour={tour} />
          </li>
        ))}
      </ul>
    );
  }, [scheduleLoaded, tours]);

  return (
    <TelegramMiniAppShell season={activeSeason}>
      <TelegramCatalogHero season={activeSeason} />
      <div className="mx-auto max-w-lg space-y-5 px-4 pb-8 pt-2">
        <SeasonTabs activeSeason={activeSeason} onSeasonChange={handleSeasonChange} />
        <h2 className="font-heading text-2xl text-text-primary">
          {UI.telegramMiniApp.allToursHeading}
        </h2>
        {content}
      </div>
    </TelegramMiniAppShell>
  );
};

export default TelegramCatalogPage;
