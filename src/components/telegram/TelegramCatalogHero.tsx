import PlaceholderImage from '../shared/PlaceholderImage';
import BrandWordmark from '../shared/BrandWordmark';
import { UI } from '../../constants/ui';
import { TELEGRAM_MINI_APP_HERO_IMAGE } from '../../constants/telegramMiniApp';
import type { Season } from '../../types';

interface TelegramCatalogHeroProps {
  season: Season;
}

const TelegramCatalogHero = ({ season }: TelegramCatalogHeroProps) => (
  <section className="relative overflow-hidden">
    <PlaceholderImage
      src={TELEGRAM_MINI_APP_HERO_IMAGE}
      alt=""
      className="h-44 w-full"
      imgClassName="object-cover"
      loading="eager"
      fetchPriority="high"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-surface-light/20 via-surface-light/55 to-surface-light" />
    <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-2 text-center">
      <h1 className="text-2xl tracking-wide">
        <BrandWordmark
          season={season}
          wordmark={UI.telegramMiniApp.brandTitle}
          restClassName="text-brand-primary"
        />
      </h1>
      <p className="mt-1 inline-block rounded-full bg-white px-3 py-0.5 font-body text-sm text-text-primary">
        {UI.telegramMiniApp.brandSubtitle}
      </p>
    </div>
  </section>
);

export default TelegramCatalogHero;
