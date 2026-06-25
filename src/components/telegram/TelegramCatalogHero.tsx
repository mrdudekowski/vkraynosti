import PlaceholderImage from '../shared/PlaceholderImage';
import { UI } from '../../constants/ui';
import { TELEGRAM_MINI_APP_HERO_IMAGE } from '../../constants/telegramMiniApp';

const TelegramCatalogHero = () => (
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
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <span
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-secondary text-brand-secondary"
        aria-hidden
      >
        ✦
      </span>
      <h1 className="font-brand-wordmark text-2xl tracking-wide text-brand-primary">
        {UI.telegramMiniApp.brandTitle}
      </h1>
      <p className="mt-1 font-body text-sm text-brand-secondary">
        {UI.telegramMiniApp.brandSubtitle}
      </p>
    </div>
  </section>
);

export default TelegramCatalogHero;
